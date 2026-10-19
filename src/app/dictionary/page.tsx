import type { Metadata } from "next";
import Link from "next/link";
import { DictionaryResults } from "@/components/public/dictionary-results";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "Dictionary",
  description: "Search published Mombasa Kutchi words and their English meanings.",
};
export const instant = false;

export default async function DictionaryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; letter?: string | string[]; page?: string | string[] }>;
}) {
  const values = await searchParams;
  const queryValue = Array.isArray(values.q) ? values.q[0] : values.q;
  const query = (queryValue ?? "").trim().slice(0, 100);
  const letterValue = Array.isArray(values.letter) ? values.letter[0] : values.letter;
  const letter = /^[A-Z]$/i.test(letterValue ?? "") ? letterValue!.toUpperCase() : "";
  const pageValue = Array.isArray(values.page) ? values.page[0] : values.page;
  const parsedPage = Number(pageValue);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1;

  return (
    <PublicShell>
      <div className="page-width interior-page">
        <div className="page-intro">
          <p className="eyebrow">Language / Dictionary</p>
          <h1>Words to carry forward.</h1>
          <p>
            Search published Mombasa Kutchi entries by word or English meaning.
            The written system is a working draft, and spelling marks can
            change meaning.
          </p>
        </div>
        <form className="dictionary-search" action="/dictionary" method="get" role="search">
          <label htmlFor="dictionary-query">Search the dictionary</label>
          <div className="search-field">
            <input
              id="dictionary-query"
              key={query}
              name="q"
              type="search"
              defaultValue={query}
              maxLength={100}
              placeholder="Word or meaning"
            />
            <button type="submit">Search <span aria-hidden="true">↗</span></button>
          </div>
          <p className="field-note">
            Apostrophes and <code>(n)</code> are part of the spelling. Exact
            spellings are shown first when available.
          </p>
        </form>
        <div className="dictionary-layout">
          <div>
            <DictionaryResults key={`${query}|${letter}|${page}`} query={query} letter={letter} page={page} />
          </div>
          <aside className="side-note">
            <p className="eyebrow">A note on spelling</p>
            <h2>A living system of writing.</h2>
            <p>
              Draft 0.3 records current working conventions and questions
              still being explored.
            </p>
            <Link className="text-link" href="/orthography">
              Read the orthography guide <span aria-hidden="true">↗</span>
            </Link>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
