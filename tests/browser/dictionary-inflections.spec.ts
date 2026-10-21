import { expect, test } from "@playwright/test";

const entryId = "91aa42d0-42e7-477c-8384-e28166322e87";
const ownedExample = {
  id: "55516d0f-e2f4-4bd4-bd37-26611598c002",
  kutchi_text: "Kuroo kare(n)tho?",
  english_translation: "What are you doing?",
  original_transcription: "Kuroo karentho?",
  source_title: "Owner-supplied East African Kutchi verb elicitation",
};
const linkedExample = {
  id: "e49fe86e-65bf-47f2-bceb-75f212574b6c",
  kutchi_text: "Jaldi kar!",
  english_translation: "Do it quickly!",
  original_transcription: "Jaldi kar!",
  source_title: "Owner-supplied East African Kutchi verb elicitation",
};
const entry = {
  id: entryId,
  headword: "kar",
  part_of_speech: "verb",
  linguistic_tags: ["action verb"],
  word_forms: [{ id: "preferred", spelling: "kar", is_preferred: true }],
  inflected_forms: [
    {
      id: "present",
      written_form: "kare(n)tho",
      original_transcription: "karentho",
      grammatical_person: "second",
      grammatical_number: "singular",
      gender: "masculine",
      tense: "present",
      aspect: null,
      mood: "indicative",
      evidence_status: "attested",
    },
    {
      id: "past",
      written_form: "kyose",
      grammatical_person: "first",
      grammatical_number: "singular",
      tense: "past",
      evidence_status: "provisional",
    },
    {
      id: "imperative",
      written_form: "kar",
      grammatical_number: "singular",
      mood: "imperative",
      evidence_status: "attested",
    },
  ],
  senses: [{ id: "sense", gloss_en: "do", examples: [ownedExample] }],
  linked_examples: [ownedExample, linkedExample],
};

test("inflection search opens the published lemma and detail distinguishes evidence", async ({ page }) => {
  await page.route("**/api/dictionary**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname === `/api/dictionary/${entryId}`) {
      await route.fulfill({ json: { data: entry } });
    } else if (url.pathname === "/api/dictionary") {
      await route.fulfill({ json: {
        data: [entry],
        pagination: { page: 1, limit: 24, total: 1, hasMore: false },
      } });
    } else {
      await route.continue();
    }
  });

  await page.goto("/dictionary?q=kare(n)tho");
  await expect(page.getByRole("heading", { name: "Exact spelling" })).toBeVisible();
  const lemma = page.getByRole("link", { name: /kar.*Matched form.*kare\(n\)tho/i });
  await expect(lemma).toHaveAttribute("href", `/dictionary/${entryId}`);
  await lemma.click();

  await expect(page.getByRole("heading", { name: "Conjugations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Present", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Past", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Imperative", exact: true })).toBeVisible();
  await expect(page.getByText("Speaker attested").first()).toBeVisible();
  await expect(page.getByText("Provisional", { exact: true })).toBeVisible();
  await expect(page.getByText(/Original transcription: karentho/)).toBeVisible();
  await expect(page.getByText(ownedExample.kutchi_text, { exact: true })).toHaveCount(1);
  await expect(page.getByText(linkedExample.kutchi_text, { exact: true })).toBeVisible();
  await expect(page.getByText("Original transcription: Kuroo karentho?")).toBeVisible();
  await expect(page.getByText("Original transcription: Jaldi kar!")).toHaveCount(0);
  await expect(page.getByText("Source: Owner-supplied East African Kutchi verb elicitation")).toHaveCount(2);

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.locator(".conjugations__form").getByText("kare(n)tho", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)).toBe(false);
  await page.screenshot({ path: "test-results/dictionary-inflections-mobile.png", fullPage: true });

  await page.goto("/dictionary?q=karentho");
  await expect(page.getByRole("heading", { name: "Exact spelling" })).toBeVisible();
  await expect(page.getByText(/Source transcription: karentho → kare\(n\)tho/)).toBeVisible();
});

test("noun forms are shown as recorded forms without implying verb conjugation", async ({ page }) => {
  const noun = {
    ...entry,
    headword: "chokro",
    part_of_speech: "noun",
    inflected_forms: [
      { id: "plural", written_form: "chokra", grammatical_number: "plural", gender: "masculine", evidence_status: "attested" },
      { id: "context", written_form: "chokre", grammatical_number: null, gender: null, evidence_status: "provisional" },
    ],
  };
  await page.route(`**/api/dictionary/${entryId}`, route => route.fulfill({ json: { data: noun } }));
  await page.goto(`/dictionary/${entryId}`);
  await expect(page.getByRole("heading", { name: "Recorded forms" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plural", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Context not settled" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Conjugations" })).toHaveCount(0);
});
