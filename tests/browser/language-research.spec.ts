import { expect, test } from "@playwright/test";

const studies = [
  "what-ke-marks",
  "verbs-agreement-and-time",
  "nouns-gender-and-distance",
  "wanting-and-experiencers",
  "connecting-kutchi-clauses",
  "la-and-jo-beneficiary-and-possession",
  "how-negation-works-in-my-kutchi",
] as const;

test("research library displays seven illustrated, navigable studies", async ({ page }) => {
  await page.goto("/language/articles");
  await expect(page.getByRole("heading", { name: "What the sentences are teaching us." })).toBeVisible();
  const tiles = page.locator(".research-tile");
  await expect(tiles).toHaveCount(7);
  for (const slug of studies) {
    await expect(tiles.locator(`a[href="/language/articles/${slug}"]`).first()).toBeVisible();
  }
  await expect(page.locator(".research-tile img")).toHaveCount(7);
});

test("ke study preserves the critical paired construction and links terms to the dictionary", async ({ page }) => {
  await page.goto("/language/articles/what-ke-marks");
  await expect(page.getByRole("heading", { level: 1, name: /What does ke mark/ })).toBeVisible();
  await expect(page.getByText("Au(n) hin chokro ke disa(n)tho", { exact: true })).toBeVisible();
  await expect(page.getByText("Au(n) hee chokro disa(n)tho", { exact: true })).toBeVisible();
  await expect(page.getByText("chokre ke kapetho", { exact: true })).toBeVisible();
  await expect(page.getByText("chokro ke kapetho", { exact: true })).toBeVisible();
  await expect(page.locator('a[href="#word-note-ke"]').first()).toBeVisible();
  await page.locator('a[href="#word-note-ke"]').first().click();
  await expect(page.locator('#word-note-ke a[href="/dictionary?q=ke"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "How this article was prepared" })).toBeVisible();
});

test("each article has source context, original illustration and vocabulary links", async ({ page, request }) => {
  for (const slug of studies) {
    await page.goto(`/language/articles/${slug}`);
    await expect(page.locator("article.research-article h1")).toBeVisible();
    await expect(page.locator("article.research-article > figure img")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Words in this study" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How this article was prepared" })).toBeVisible();
    await expect(page.locator(".research-wordnotes a[href^='/dictionary?q=']").first()).toBeVisible();
    const path = await page.locator("article.research-article > figure img").getAttribute("src");
    expect(path).toBeTruthy();
    const response = await request.get(path!);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("image/svg+xml");
  }
});

test("research articles can be reached from Language and Grammar", async ({ page }) => {
  await page.goto("/language");
  await page.getByRole("link", { name: /Browse research articles/i }).click();
  await expect(page).toHaveURL(/\/language\/articles$/);
  await page.goto("/language/grammar");
  await expect(page.getByRole("link", { name: "Read the research articles" })).toHaveAttribute("href", "/language/articles");
});

test("unknown article slug returns not found", async ({ page }) => {
  const response = await page.goto("/language/articles/not-a-real-study");
  expect(response?.status()).toBe(404);
});

test("research articles have no horizontal page overflow on narrow phones", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const slug of studies) {
    await page.goto(`/language/articles/${slug}`);
    await expect(page.locator("article.research-article h1")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal page overflow for ${slug}`).toBeLessThanOrEqual(1);
  }
});


test("Case and syntax papers include three word-order alternatives as analyses, not invented translations", async ({ page }) => {
  for (const slug of ["what-ke-marks", "connecting-kutchi-clauses"]) {
    await page.goto(`/language/articles/${slug}`);
    const orderCards = page.locator(".research-example").filter({
      has: page.locator(".research-example__structure-label"),
    });
    await expect(orderCards).toHaveCount(3);
    await expect(orderCards.locator(".research-example__sentence")).toHaveText([
      "Au(n) chada(n)tho hin ke",
      "Chada(n)tho au(n) hin ke",
      "hin ke au(n) chada(n)tho",
    ]);
    await expect(orderCards.locator(".research-example__structure-label")).toHaveText([
      "Constituent order · ",
      "Constituent order · ",
      "Constituent order · ",
    ]);
    await expect(page.getByText(/I have not yet tested whether a different position changes the emphasis or topic|I have not yet established whether these alternatives differ in topic/)).toBeVisible();
  }
});

test("the new postposition article preserves the beneficiary-versus-possessor contrast", async ({ page }) => {
  await page.goto("/language/articles/la-and-jo-beneficiary-and-possession");
  await expect(page.getByRole("heading", { level: 1, name: /For him, or his/ })).toBeVisible();
  const exampleText = page.locator(".research-example__sentence");
  await expect(exampleText.filter({ hasText: "Hin la au(n) pe(n)sa kayose" })).toHaveCount(2);
  await expect(exampleText.filter({ hasText: "Hin jo pe(n)sa au(n) kayose" })).toHaveCount(2);
  await expect(page.getByText("I picked up money for him.", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("I picked up his money.", { exact: true }).first()).toBeVisible();
  await expect(page.locator("#word-note-la a[href='/dictionary?q=la']")).toBeVisible();
  await expect(page.locator("#word-note-jo a[href='/dictionary?q=jo']")).toBeVisible();
  await expect(page.locator("#word-note-khade")).toBeVisible();
  // Exact-form notes must not silently collapse khade into the khadho note.
  await page.locator(".research-example__sentence a[href='#word-note-khade']").first().click();
  await expect(page).toHaveURL(/#word-note-khade$/);
});

test("the negation article keeps attested contrasts apart from untranslated elicitation examples", async ({ page }) => {
  await page.goto("/language/articles/how-negation-works-in-my-kutchi");
  await expect(page.getByRole("heading", { level: 1, name: /Not just one way to say no/ })).toBeVisible();
  const examples = page.locator(".research-example__sentence");
  await expect(examples.filter({ hasText: "Natho sume" })).toHaveCount(1);
  await expect(examples.filter({ hasText: "Nathi sume" })).toHaveCount(1);
  await expect(examples.filter({ hasText: "Hee mukhe pe(n)sa natho dye" })).toHaveCount(1);
  await expect(examples.filter({ hasText: "Hee mukhe pe(n)sa nai dhine" })).toHaveCount(1);
  await expect(page.locator(".research-example").filter({ hasText: "Natho sume" }).getByText("He won't sleep.", { exact: true })).toBeVisible();
  await expect(page.locator(".research-example").filter({ hasText: "Nathi sume" }).getByText("She won't sleep.", { exact: true })).toBeVisible();
  await expect(page.locator(".research-example").filter({ hasText: "Hee mukhe pe(n)sa nai dhine" }).getByText("He hasn't given me money.", { exact: true })).toBeVisible();
  await expect(page.locator(".research-example").filter({ hasText: "Hee mukhe pe(n)sa natho dye" }).getByText("He doesn't give me money.", { exact: true })).toBeVisible();
  await expect(page.getByText("He is not sleeping.", { exact: true })).toHaveCount(0);
  await expect(page.getByText("She is not sleeping.", { exact: true })).toHaveCount(0);
  await expect(page.getByText("He didn't give me money.", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Editorial correction from the speaker", { exact: true })).toBeVisible();
  await expect(examples.filter({ hasText: "Hin ke au(n) pe(n)sa nai dhineese" })).toHaveCount(1);
  await expect(examples.filter({ hasText: "hin ke au(n) pe(n)sa nathi dhya(n)" })).toHaveCount(1);
  await expect(page.locator(".research-example__structure-label").filter({ hasText: "Elicitation context" })).toHaveCount(2);
  await expect(page.getByText(/participant roles remain to be checked/).first()).toBeVisible();
  for (const word of ["natho", "nathi", "nai", "nah"]) {
    await expect(page.locator(`#word-note-${word} a[href="/dictionary?q=${word}"]`)).toBeVisible();
  }
});

test("new papers are featured in the research index, with working routes and metadata", async ({ page }) => {
  await page.goto("/language/articles");
  const featured = page.locator(".research-index__latest");
  await expect(featured.getByRole("link")).toHaveCount(2);
  await expect(featured.getByRole("link").first()).toHaveAttribute("href", "/language/articles/la-and-jo-beneficiary-and-possession");
  await expect(featured.getByRole("link").last()).toHaveAttribute("href", "/language/articles/how-negation-works-in-my-kutchi");
  await page.goto("/language/grammar");
  await expect(page.getByRole("link", { name: /Read the full research article about la and jo/i })).toHaveAttribute("href", "/language/articles/la-and-jo-beneficiary-and-possession");
  await expect(page.getByRole("link", { name: /Read my full study of Kutchi negation/i })).toHaveAttribute("href", "/language/articles/how-negation-works-in-my-kutchi");
});
