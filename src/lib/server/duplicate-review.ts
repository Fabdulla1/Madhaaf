import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { confirmsDuplicates, duplicateScore, type DuplicateConfirmation, type DuplicateEntity, type DuplicateMatch, type DuplicateReview } from "@/lib/duplicate-matching";
import { error } from "./http";

export const duplicateConfirmationSchema = z.object({
  entity: z.enum(["dictionary", "people"]), query: z.string().min(1).max(300),
  matched_ids: z.array(z.string().uuid()).min(1).max(1000),
}).strict();

type Candidate = { id: string; text: string; score: number };
type Sense = { gloss_en: string; definition_en: string | null };

export async function findDuplicates(db: SupabaseClient, entity: DuplicateEntity, query: string, exactOnly = false, signal?: AbortSignal): Promise<DuplicateReview> {
  const candidates = new Map<string, Candidate>();
  const sources = entity === "dictionary"
    ? [{ table: "lexemes", columns: "id,headword", id: "id", text: "headword" }, { table: "word_forms", columns: "lexeme_id,spelling", id: "lexeme_id", text: "spelling" }]
    : [{ table: "family_members", columns: "id,preferred_name", id: "id", text: "preferred_name" }, { table: "member_names", columns: "member_id,name", id: "member_id", text: "name" }];
  // Read narrow projections in pages: names beyond the first database page
  // must still be checked. No private record data is cached across requests.
  for (const source of sources) {
    for (let offset = 0; ; offset += 500) {
      let request = db.from(source.table).select(source.columns).order("id").range(offset, offset + 499);
      if (signal) request = request.abortSignal(signal);
      const { data, error: dbError } = await request;
      if (dbError) throw Error("Could not check existing records");
      const rows = (data ?? []) as unknown as Record<string, string>[];
      for (const row of rows) {
        const score = duplicateScore(query, row[source.text], entity, exactOnly);
        if (score === null) continue;
        const id = row[source.id], previous = candidates.get(id);
        if (!previous || score < previous.score) candidates.set(id, { id, text: row[source.text], score });
      }
      if (rows.length < 500) break;
    }
  }
  const ranked = [...candidates.values()].sort((a, b) => a.score - b.score || a.text.localeCompare(b.text) || a.id.localeCompare(b.id));
  const exactIds = ranked.filter(candidate => candidate.score === 0).map(candidate => candidate.id);
  const top = ranked.slice(0, 10);
  const review: DuplicateReview = { entity, query, exactIds, matches: [], hasMore: ranked.length > top.length };
  if (!top.length) return review;
  let request = entity === "dictionary"
    ? db.from("lexemes").select("id,headword,part_of_speech,status,usage_note,senses(gloss_en,definition_en,display_order)").in("id", top.map(c => c.id)).order("display_order", { referencedTable: "senses" }).limit(3, { referencedTable: "senses" })
    : db.from("family_members").select("id,preferred_name,birth_date_text,death_date_text,birthplace,short_bio,living_status,visibility,status").in("id", top.map(c => c.id));
  if (signal) request = request.abortSignal(signal);
  const { data, error: dbError } = await request;
  if (dbError) throw Error("Could not load matching records");
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  review.matches = top.flatMap(candidate => {
    const row = rows.find(row => row.id === candidate.id);
    if (!row) return [];
    const details: DuplicateMatch["details"] = [];
    const add = (label: string, value: unknown) => { if (typeof value === "string" && value) details.push({ label, value: value.slice(0, 600) }); };
    let summary = "";
    if (entity === "dictionary") {
      const senses = (row.senses ?? []) as Sense[];
      summary = senses.map(sense => sense.gloss_en).join("; ").slice(0, 300);
      add("Part of speech", row.part_of_speech);
      for (const sense of senses) add("Meaning", [sense.gloss_en, sense.definition_en].filter(Boolean).join(" — "));
      add("Usage", row.usage_note);
    } else {
      summary = typeof row.short_bio === "string" ? row.short_bio.slice(0, 500) : "";
      add("Born", row.birth_date_text); add("Died", row.death_date_text); add("Birthplace", row.birthplace);
      add("Living status", row.living_status); add("Visibility", row.visibility);
    }
    return [{ id: candidate.id, label: String(row[entity === "dictionary" ? "headword" : "preferred_name"]), matchedText: candidate.text, exact: candidate.score === 0, status: String(row.status), summary, details }];
  });
  // An entry disappearing during the read is not a reason to demand consent
  // to an unavailable preview. A later save always performs a fresh check.
  review.exactIds = exactIds.filter(id => !top.some(c => c.id === id) || review.matches.some(match => match.id === id));
  return review;
}

export async function requireDuplicateReview(db: SupabaseClient, entity: DuplicateEntity, query: string, confirmation?: DuplicateConfirmation, signal?: AbortSignal) {
  try {
    const review = await findDuplicates(db, entity, query, true, signal);
    if (review.exactIds.length && !confirmsDuplicates(review, confirmation)) return Response.json({
      code: "DUPLICATE_REVIEW_REQUIRED", error: "Review the existing matches before creating another record.", review,
    }, { status: 409, headers: { "Cache-Control": "private, no-store" } });
    return null;
  } catch {
    return error("Could not check for duplicates. Please try saving again.", 503);
  }
}
