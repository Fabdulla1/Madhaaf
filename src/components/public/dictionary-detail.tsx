"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type ApiResult, type DictionaryEntry, readPublicApi } from "./content-api";
import { ContentState, LoadingState } from "./content-state";

export function DictionaryDetail({ id }: { id: string }) {
  const [result, setResult] = useState<ApiResult<DictionaryEntry> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    readPublicApi<DictionaryEntry>(`/api/dictionary/${encodeURIComponent(id)}`, controller.signal)
      .then(setResult).catch(() => {});
    return () => controller.abort();
  }, [id]);

  return (
    <div className="page-width interior-page detail-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span>
        <Link href="/dictionary">Dictionary</Link>
      </nav>
      {!result ? <LoadingState label="Loading entry…" /> : result.status !== "success" ? (
        <ContentState
          title={result.status === "not-found" ? "Entry not found" : "Entry unavailable"}
          description={result.status === "not-found"
            ? "This entry may be unpublished or the address may have changed."
            : "This entry could not be loaded right now."}
          action={{ label: "Return to the dictionary", href: "/dictionary" }}
        />
      ) : <EntryContent entry={result.data} />}
    </div>
  );
}

function EntryContent({ entry }: { entry: DictionaryEntry }) {
  const forms = entry.word_forms?.filter((form) => form.spelling !== entry.headword) ?? [];
  const audio = entry.media?.filter((item) => item.kind === "audio" && item.url) ?? [];
  return (
    <article className="entry-detail">
      <div className="entry-detail__header">
        <p className="eyebrow">Madhaaf / Dictionary</p>
        <h1>{entry.headword}</h1>
        <div className="entry-meta">
          {entry.part_of_speech && <span>{entry.part_of_speech}</span>}
          {entry.linguistic_tags?.map(tag => <span key={tag}>{tag}</span>)}
          {entry.orthography_version?.label && <span>Orthography {entry.orthography_version.label}</span>}
        </div>
      </div>
      <div className="detail-grid">
        <div className="reading-column">
          <section className="entry-section">
            <h2>Meaning</h2>
            {entry.senses?.length ? (
              <ol className="sense-list">
                {entry.senses.map((sense) => (
                  <li key={sense.id}>
                    <h3>{sense.gloss_en}</h3>
                    {sense.definition_en && <p>{sense.definition_en}</p>}
                    {sense.examples?.length ? (
                      <div className="examples">
                        <p className="examples__label">In use</p>
                        {sense.examples.map((example) => (
                          <blockquote key={example.id}>
                            <p>{example.kutchi_text}</p>
                            {example.english_translation && <footer>{example.english_translation}</footer>}
                            {example.note && <small>{example.note}</small>}
                          </blockquote>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : <p>Meanings are being prepared for this entry.</p>}
          </section>
          {entry.usage_note && <section className="entry-section"><h2>Usage notes</h2><p>{entry.usage_note}</p></section>}
          {entry.morphology_note && <section className="entry-section"><h2>Morphology</h2><p>{entry.morphology_note}</p></section>}
          {entry.etymology_note && <section className="entry-section"><h2>Word history</h2><p>{entry.etymology_note}</p></section>}
          {audio.length > 0 && (
            <section className="entry-section">
              <h2>Listen</h2>
              <div className="audio-list">
                {audio.map((item) => (
                  <figure key={item.id}>
                    <figcaption>{item.caption || "Pronunciation recording"}{item.speaker_name && ` · ${item.speaker_name}`}</figcaption>
                    <audio controls preload="none" src={item.url ?? undefined}>Your browser cannot play this recording.</audio>
                    {item.attribution && <small>{item.attribution}</small>}
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="detail-aside">
          {forms.length > 0 && <div><h2>Other spellings</h2><ul>{forms.map((form) => <li key={form.id}>{form.spelling}</li>)}</ul></div>}
          <div>
            <h2>About this spelling</h2>
            <p>The writing system is a working draft. Apostrophes and <code>(n)</code> are preserved as written.</p>
            <Link className="text-link" href="/orthography">Read the guide <span aria-hidden="true">↗</span></Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
