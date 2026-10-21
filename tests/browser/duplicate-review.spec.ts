import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { confirmsDuplicates, duplicateScore, normalizeDuplicateText } from "../../src/lib/duplicate-matching";
import { findDuplicates, requireDuplicateReview } from "../../src/lib/server/duplicate-review";

const wordId = "11111111-1111-4111-8111-111111111111";
const personId = "22222222-2222-4222-8222-222222222222";
const otherId = "33333333-3333-4333-8333-333333333333";
type Row = Record<string, unknown>;
function database(tables: Record<string, Row[]>, failTable?: string) {
  const requests: URL[] = [];
  const db = createClient("https://database.example", "test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async input => {
      const url = new URL(String(input)); requests.push(url);
      const table = url.pathname.split("/").at(-1)!;
      if (table === failTable) return Response.json({ message: "Database unavailable" }, { status: 503 });
      let rows = tables[table] ?? [];
      const ids = url.searchParams.get("id");
      if (ids) rows = rows.filter(row => ids.includes(String(row.id)));
      const offset = Number(url.searchParams.get("offset") || 0);
      const limit = Number(url.searchParams.get("limit") || rows.length);
      return Response.json(rows.slice(offset, offset + limit));
    } },
  });
  return { db, requests };
}

test("exact spelling retains Kutchi marks while folding case and Unicode composition", () => {
  expect(duplicateScore("  CHAI ", "chai", "dictionary")).toBe(0);
  expect(duplicateScore("a\u0304", "ā", "dictionary")).toBe(0);
  for (const [a, b] of [["a", "ā"], ["aa", "ā"], ["‘l", "l"], ["‘l", "'l"], ["ma(n)", "man"], ["a b", "a  b"]]) {
    expect(duplicateScore(a, b, "dictionary", true), `${a} differs from ${b}`).toBeNull();
  }
  expect(normalizeDuplicateText(" Amina  ABDULLA ", "people")).toBe("amina abdulla");
  expect(duplicateScore(" Amina  ABDULLA ", "Amina Abdulla", "people", true)).toBe(0);
});

test("suggestions find small typos, transpositions, prefixes and partial names without treating them as exact", () => {
  for (const query of ["chsi", "cahi", "cha"]) expect(duplicateScore(query, "chai", "dictionary")).toBeGreaterThan(0);
  expect(duplicateScore("Amina A", "Amina Abdulla", "people")).toBeGreaterThan(0);
  expect(duplicateScore("Abd Amina", "Amina Abdulla", "people")).toBeGreaterThan(0);
  expect(duplicateScore("Abdulla", "Amina Abdulla", "people")).toBeGreaterThan(0);
  expect(duplicateScore("a", "amina", "people")).toBeNull();
  expect(duplicateScore("mountain", "chai", "dictionary")).toBeNull();
  expect(duplicateScore("%_", "chai", "dictionary")).toBeNull();
});

test("confirmation is bound to the submitted name, entity and every fresh exact match", () => {
  const review = { entity: "people" as const, query: "Amina Abdulla", exactIds: [personId] };
  const confirmation = { entity: "people" as const, query: " AMINA ABDULLA ", matched_ids: [personId] };
  expect(confirmsDuplicates(review)).toBe(false);
  expect(confirmsDuplicates(review, confirmation)).toBe(true);
  expect(confirmsDuplicates({ ...review, query: "Amina Patel" }, confirmation)).toBe(false);
  expect(confirmsDuplicates({ ...review, entity: "dictionary" }, confirmation)).toBe(false);
  expect(confirmsDuplicates({ ...review, exactIds: [personId, otherId] }, confirmation)).toBe(false);
});

test("dictionary lookup covers later pages and variants, deduplicates records and returns meanings", async () => {
  const lexemes = Array.from({ length: 500 }, (_, i) => ({ id: `filler-${i}`, headword: `unrelated-${i}` }));
  const { db, requests } = database({
    lexemes: [...lexemes, { id: wordId, headword: "chāi", status: "draft", part_of_speech: "noun", senses: [{ gloss_en: "tea", definition_en: "A warm drink" }] }],
    word_forms: [{ id: "form-1", lexeme_id: wordId, spelling: "chai" }, { id: "form-2", lexeme_id: wordId, spelling: "Chai" }],
  });
  const review = await findDuplicates(db, "dictionary", "chai");
  expect(review.exactIds).toEqual([wordId]);
  expect(review.matches).toHaveLength(1);
  expect(review.matches[0]).toMatchObject({ label: "chāi", matchedText: "chai", exact: true, summary: "tea" });
  expect(requests.some(url => url.pathname.endsWith("/lexemes") && url.searchParams.get("offset") === "500")).toBe(true);
  expect(requests.some(url => url.searchParams.get("senses.limit") === "3")).toBe(true);
});

test("a recorded inflection suggests its parent lemma before another entry is created", async () => {
  const { db } = database({
    lexemes: [{ id: wordId, headword: "kar", status: "published", part_of_speech: "verb", senses: [{ gloss_en: "do" }] }],
    word_forms: [],
    inflected_forms: [{ id: "form-1", lexeme_id: wordId, written_form: "kare(n)tho", original_transcription: "karentho" }],
  });
  for (const spelling of ["kare(n)tho", "karentho"]) {
    const review = await findDuplicates(db, "dictionary", spelling, true);
    expect(review.exactIds).toEqual([wordId]);
    expect(review.matches[0]).toMatchObject({ label: "kar", matchedText: spelling, exact: true, summary: "do" });
  }
});

test("person aliases trigger review and previews exclude private editorial notes", async () => {
  const { db, requests } = database({ family_members: [{ id: personId, preferred_name: "Amina Abdulla", status: "draft", short_bio: "A teacher", birthplace: "Bhuj, Gujarat, India", birth_date_text: "1940", private_notes: "PRIVATE SECRET" }], member_names: [{ id: "name-1", member_id: personId, name: "Amina Patel" }] });
  const review = await findDuplicates(db, "people", "Amina Patel");
  expect(review.matches[0]).toMatchObject({ label: "Amina Abdulla", matchedText: "Amina Patel", exact: true, summary: "A teacher" });
  expect(JSON.stringify(review)).not.toContain("PRIVATE SECRET");
  expect(requests.every(url => !url.searchParams.get("select")?.includes("private_notes"))).toBe(true);
  const response = await requireDuplicateReview(db, "people", "Amina Patel");
  expect(response?.status).toBe(409);
  expect(response?.headers.get("Cache-Control")).toBe("private, no-store");
  expect(await requireDuplicateReview(db, "people", "Amina Patel", { entity: "people", query: "Amina Patel", matched_ids: [personId] })).toBeNull();
  expect((await requireDuplicateReview(db, "people", "Amina Patel", { entity: "people", query: "Someone else", matched_ids: [personId] }))?.status).toBe(409);
});

test("similar names do not block save; exact matches outrank fuzzy results; lookup failures block save", async () => {
  const family_members = Array.from({ length: 12 }, (_, i) => ({ id: `person-${i}`, preferred_name: "Amina", status: "draft" }));
  const { db } = database({ family_members: [...family_members, { id: personId, preferred_name: "Amini", status: "draft" }], member_names: [] });
  const review = await findDuplicates(db, "people", "Amini");
  expect(review.matches[0].id).toBe(personId);
  expect(review.matches).toHaveLength(10);
  expect(review.hasMore).toBe(true);
  expect(await requireDuplicateReview(db, "people", "Aminah")).toBeNull();
  const { db: broken } = database({}, "member_names");
  await expect(findDuplicates(broken, "people", "Amina")).rejects.toThrow();
  expect((await requireDuplicateReview(broken, "people", "Amina"))?.status).toBe(503);
});
