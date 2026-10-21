"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type ApiResult, type DictionaryEntry, readPublicApi } from "./content-api";
import { ContentState, LoadingState } from "./content-state";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function firstLetter(word: string) {
  const initial = word.trim().charAt(0).toLocaleUpperCase();
  return /^[A-Z]$/.test(initial) ? initial : "#";
}

function hasExactSpelling(entry: DictionaryEntry, query: string) {
  const q = query.toLocaleLowerCase();
  return (
    entry.headword.toLocaleLowerCase() === q ||
    entry.word_forms?.some((form) => form.spelling.toLocaleLowerCase() === q) ||
    entry.inflected_forms?.some((form) =>
      form.written_form.toLocaleLowerCase() === q ||
      form.original_transcription?.toLocaleLowerCase() === q)
  );
}

function matchingInflection(entry: DictionaryEntry, query: string) {
  const q = query.toLocaleLowerCase();
  const forms = entry.inflected_forms ?? [];
  const written = forms.filter(form => form.written_form.toLocaleLowerCase() === q);
  const original = forms.filter(form => form.original_transcription?.toLocaleLowerCase() === q);
  const matches = written.length ? written : original;
  return matches.find(form => form.evidence_status === "attested") ?? matches[0];
}

function pageHref(query: string, letter: string, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  else if (letter) params.set("letter", letter);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return suffix ? `/dictionary?${suffix}` : "/dictionary";
}

function EntryLink({ entry, query = "" }: { entry: DictionaryEntry; query?: string }) {
  const match = query && entry.headword.toLocaleLowerCase() !== query.toLocaleLowerCase()
    ? matchingInflection(entry, query) : undefined;
  const sourceSpelling = match?.original_transcription?.toLocaleLowerCase() === query.toLocaleLowerCase()
    && match.original_transcription !== match.written_form;
  return (
    <Link href={`/dictionary/${entry.id}`} className="dictionary-row">
      <span className="dictionary-row__head">
        <strong>{entry.headword}</strong>
        {entry.part_of_speech && <span className="small-tag">{entry.part_of_speech}</span>}
      </span>
      <span className="dictionary-row__gloss">
        {entry.senses?.map((sense) => sense.gloss_en).filter(Boolean).slice(0, 2).join(" · ") || "View meanings"}
        {match && <span className="dictionary-row__matched-form">
          {sourceSpelling ? "Source transcription" : "Matched form"}: <strong>{sourceSpelling ? match.original_transcription : match.written_form}</strong>
          {sourceSpelling && <> → {match.written_form}</>}
          <span className="dictionary-row__evidence"> · {match.evidence_status === "attested" ? "speaker attested" : "provisional"}</span>
        </span>}
      </span>
      <span className="dictionary-row__arrow" aria-hidden="true">↗</span>
    </Link>
  );
}

function Pager({
  query,
  letter,
  page,
  total,
  limit,
  hasMore,
}: {
  query: string;
  letter: string;
  page: number;
  total: number;
  limit: number;
  hasMore: boolean;
}) {
  if (page === 1 && !hasMore) return null;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  return (
    <nav className="list-pagination" aria-label="Dictionary pages">
      {page > 1 ? <Link href={pageHref(query, letter, page - 1)}>← Previous</Link> : <span />}
      <span>Page {page} of {pageCount}</span>
      {hasMore ? <Link href={pageHref(query, letter, page + 1)}>Next →</Link> : <span />}
    </nav>
  );
}

export function DictionaryResults({
  query,
  letter,
  page,
}: {
  query: string;
  letter: string;
  page: number;
}) {
  const [result, setResult] = useState<ApiResult<DictionaryEntry[]> | null>(null);
  const selectedLetter = query ? "" : letter;

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: "24" });
    if (query) params.set("q", query);
    else if (selectedLetter) params.set("letter", selectedLetter);
    readPublicApi<DictionaryEntry[]>(`/api/dictionary?${params.toString()}`, controller.signal)
      .then(setResult).catch(() => {});
    return () => controller.abort();
  }, [query, selectedLetter, page]);

  if (!result) return <LoadingState label="Loading dictionary entries…" />;
  if (result.status !== "success") return <ContentState
    title="Dictionary unavailable"
    description="The published entries could not be loaded. Please try again later."
  />;

  const entries = Array.isArray(result.data) ? [...result.data] : [];
  const total = result.pagination?.total ?? entries.length;
  const limit = result.pagination?.limit ?? 24;
  const hasMore = result.pagination?.hasMore ?? false;
  if (!query) entries.sort((a, b) => a.headword.localeCompare(b.headword, "en", { sensitivity: "base" }));

  const alphabet = !query && (
    <nav className="alphabet-nav" aria-label="Browse by initial letter">
      <Link href="/dictionary" className={!selectedLetter ? "is-active" : undefined} aria-current={!selectedLetter ? "page" : undefined}>All</Link>
      {ALPHABET.map((initial) => (
        <Link
          href={pageHref("", initial, 1)}
          className={selectedLetter === initial ? "is-active" : undefined}
          aria-current={selectedLetter === initial ? "page" : undefined}
          key={initial}
        >
          {initial}
        </Link>
      ))}
    </nav>
  );

  if (entries.length === 0) return (
    <section>
      {alphabet}
      <ContentState
        title={page > 1 ? "No entries on this page" : query ? "No matching entries" : selectedLetter ? `No entries under ${selectedLetter} yet` : "No published entries yet"}
        description={query
          ? `No published words matched “${query}”. Check the spelling or try an English meaning.`
          : "Reviewed words will appear here when they are published."}
        action={page > 1
          ? { label: "Return to the first page", href: pageHref(query, selectedLetter, 1) }
          : (query || selectedLetter) ? { label: "Browse all entries", href: "/dictionary" } : undefined}
      />
    </section>
  );

  if (query) {
    const exact = entries.filter((entry) => hasExactSpelling(entry, query));
    const other = entries.filter((entry) => !hasExactSpelling(entry, query));
    return (
      <section>
        <div className="list-heading">
          <h2>Search results</h2>
          <span role="status" aria-live="polite">{total} {total === 1 ? "entry" : "entries"}</span>
        </div>
        {exact.length > 0 && (
          <div className="dictionary-group">
            <h3>Exact spelling</h3>
            {exact.map((entry) => <EntryLink key={entry.id} entry={entry} query={query} />)}
          </div>
        )}
        {other.length > 0 && (
          <div className="dictionary-group">
            <h3>{exact.length ? "Other results" : "Matching entries"}</h3>
            {other.map((entry) => <EntryLink key={entry.id} entry={entry} query={query} />)}
          </div>
        )}
        <Pager query={query} letter="" page={page} total={total} limit={limit} hasMore={hasMore} />
      </section>
    );
  }

  const groups = entries.reduce<Record<string, DictionaryEntry[]>>((all, entry) => {
    const initial = firstLetter(entry.headword);
    (all[initial] ??= []).push(entry);
    return all;
  }, {});
  const letters = Object.keys(groups).sort();
  return (
    <section>
      <div className="list-heading">
        <h2>{selectedLetter ? `Words beginning with ${selectedLetter}` : "Browse A–Z"}</h2>
        <span>{total} published {total === 1 ? "entry" : "entries"}</span>
      </div>
      {alphabet}
      {letters.map((initial) => (
        <div className="dictionary-group" key={initial}>
          <h3>{initial}</h3>
          {groups[initial]?.map((entry) => <EntryLink key={entry.id} entry={entry} />)}
        </div>
      ))}
      <Pager query="" letter={selectedLetter} page={page} total={total} limit={limit} hasMore={hasMore} />
    </section>
  );
}
