"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type ApiResult, type DictionaryEntry, readPublicApi } from "./content-api";
import { ContentState, LoadingState } from "./content-state";

type InflectedForm = NonNullable<DictionaryEntry["inflected_forms"]>[number];
const FORM_GROUPS = ["Present", "Past", "Future", "Imperative", "Other recorded forms"] as const;

function formGroup(form: InflectedForm): (typeof FORM_GROUPS)[number] {
  if (form.mood?.toLowerCase() === "imperative") return "Imperative";
  if (form.tense?.toLowerCase() === "present") return "Present";
  if (form.tense?.toLowerCase() === "past") return "Past";
  if (form.tense?.toLowerCase() === "future") return "Future";
  return "Other recorded forms";
}

function featureLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function Conjugations({ forms }: { forms: InflectedForm[] }) {
  if (!forms.length) return null;
  const groups = new Map(FORM_GROUPS.map(label => [label, [] as InflectedForm[]]));
  for (const form of forms) groups.get(formGroup(form))?.push(form);
  return <section className="entry-section conjugations" aria-labelledby="conjugations-heading">
    <h2 id="conjugations-heading">Conjugations</h2>
    <p className="conjugations__intro">Recorded forms of this word. Forms not listed here have not been confirmed.</p>
    {FORM_GROUPS.map(group => {
      const groupForms = groups.get(group) ?? [];
      if (!groupForms.length) return null;
      return <section className="conjugations__group" key={group}>
        <h3>{group}</h3>
        <ul className="conjugations__list">{groupForms.map(form => {
          const features = [
            ["Person", form.grammatical_person],
            ["Number", form.grammatical_number],
            ["Gender", form.gender],
            ["Aspect", form.aspect],
            ["Mood", form.mood?.toLowerCase() === "imperative" ? null : form.mood],
            ["Address", form.politeness],
          ].filter((item): item is [string, string] => !!item[1]);
          return <li className="conjugations__item" key={form.id}>
            <div className="conjugations__form"><strong>{form.written_form}</strong><span className="conjugations__evidence">{form.evidence_status === "attested" ? "Speaker attested" : "Provisional"}</span></div>
            {features.length > 0 && <dl className="conjugations__features">{features.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{featureLabel(value)}</dd></div>)}</dl>}
            {form.original_transcription && form.original_transcription !== form.written_form && <p className="conjugations__source">Original transcription: <span>{form.original_transcription}</span></p>}
            {form.note && <p className="conjugations__note">{form.note}</p>}
          </li>;
        })}</ul>
      </section>;
    })}
  </section>;
}

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
  const ownedExampleIds = new Set(entry.senses?.flatMap(sense => sense.examples?.map(example => example.id) ?? []) ?? []);
  const linkedExamples = [...new Map((entry.linked_examples ?? [])
    .filter(example => !ownedExampleIds.has(example.id))
    .map(example => [example.id, example])).values()];
  const audio = entry.media?.filter((item) => item.kind === "audio" && item.url) ?? [];
  return (
    <article className="entry-detail">
      <div className="entry-detail__header">
        <p className="eyebrow">Madhaaf / Dictionary</p>
        <h1>{entry.headword}</h1>
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
          <Conjugations forms={entry.inflected_forms ?? []} />
          {linkedExamples.length > 0 && <section className="entry-section" aria-labelledby="linked-examples-heading">
            <h2 id="linked-examples-heading">In recorded sentences</h2>
            <p className="conjugations__intro">Sentences that also use this word.</p>
            <div className="examples">{linkedExamples.map(example => <blockquote key={example.id}>
              <p>{example.kutchi_text}</p>
              {example.english_translation && <footer>{example.english_translation}</footer>}
              {example.note && <small>{example.note}</small>}
            </blockquote>)}</div>
          </section>}
          {(entry.part_of_speech || entry.linguistic_tags?.length) && (
            <section className="entry-section entry-linguistics">
              <h2>Linguistic notes</h2>
              {entry.part_of_speech && <p><strong>Part of speech</strong> {entry.part_of_speech}</p>}
              {!!entry.linguistic_tags?.length && (
                <div>
                  <h3>Tags</h3>
                  <ul className="entry-linguistics__tags">
                    {entry.linguistic_tags.map(tag => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
              )}
              <p className="entry-linguistics__note">Grammatical labels are a working description and can be revised as more speaker evidence is reviewed.</p>
            </section>
          )}
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
