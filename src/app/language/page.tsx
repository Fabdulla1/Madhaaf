import type { Metadata } from "next";
import Link from "next/link";
import { LanguageNavigation } from "@/components/public/language-navigation";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "Language",
  description: "Explore the Mombasa Kutchi dictionary, speaker-provided grammar examples, and developing writing guide.",
};

export default function LanguagePage() {
  return (
    <PublicShell>
      <div className="page-width interior-page language-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <span aria-current="page">Language</span>
        </nav>
        <LanguageNavigation active="overview" />

        <header className="language-hero">
          <p className="eyebrow">Mombasa Kutchi / Language archive</p>
          <h1>Language is more than a list of words.</h1>
          <p>
            A word tells us what something means. A sentence shows us how people
            speak. Explore the growing dictionary, the patterns we are learning
            from real examples, and the writing guide that helps us preserve them.
          </p>
          <div className="language-hero__actions">
            <Link className="button button--primary" href="/dictionary">Explore the dictionary <span aria-hidden="true">↗</span></Link>
            <Link className="text-link" href="/language/grammar">Read the grammar notes <span aria-hidden="true">↗</span></Link>
          </div>
        </header>

        <section className="language-feature-grid" aria-label="Explore the language">
          <article className="language-feature language-feature--dictionary">
            <div>
              <p className="eyebrow">01 / Dictionary</p>
              <h2>Find a word.<br />Follow its meaning.</h2>
              <p>Search published Kutchi words and English meanings. Exact spellings remain visible, including apostrophes and nasal markers.</p>
            </div>
            <form action="/dictionary" method="get" role="search" className="language-quick-search">
              <label htmlFor="language-word-search">Look up a word</label>
              <div className="search-field">
                <input id="language-word-search" type="search" name="q" maxLength={100} placeholder="Kutchi or English…" />
                <button type="submit">Search <span aria-hidden="true">↗</span></button>
              </div>
            </form>
            <Link className="text-link" href="/dictionary">Browse all words <span aria-hidden="true">↗</span></Link>
          </article>

          <article className="language-feature language-feature--grammar">
            <div>
              <p className="eyebrow">02 / Grammar</p>
              <h2>See how a sentence works.</h2>
              <p>Compare person, gender and number in real sentences. Every example is labeled as an observation or an open question.</p>
            </div>
            <figure className="language-example">
              <blockquote lang="und">Thu(n) khadho kyenthi</blockquote>
              <figcaption>
                <span>You are eating food (addressing a woman)</span>
                <small>Pronoun · object · verb</small>
              </figcaption>
            </figure>
            <Link className="text-link" href="/language/grammar">Study the grammar <span aria-hidden="true">↗</span></Link>
          </article>
        </section>

        <section className="language-writing" aria-labelledby="language-writing-title">
          <div>
            <p className="eyebrow">03 / Writing guide</p>
            <h2 id="language-writing-title">Write what you hear.</h2>
          </div>
          <div>
            <p>
              The Latin writing system is still a draft. Learn why we keep
              marks such as <code>(n)</code> and apostrophes in our records,
              and how to write words without erasing pronunciation details.
            </p>
            <Link className="text-link" href="/orthography">Open the writing guide <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section className="language-evidence" aria-labelledby="language-evidence-title">
          <p className="eyebrow">A living record</p>
          <h2 id="language-evidence-title">What we know, and what we are still learning.</h2>
          <div className="language-evidence__grid">
            <div>
              <h3>Speaker-provided</h3>
              <p>Examples preserve the exact forms and meanings shared by a speaker of this dialect.</p>
            </div>
            <div>
              <h3>Working interpretation</h3>
              <p>Patterns such as verb endings are described cautiously while more sentences are gathered.</p>
            </div>
            <div>
              <h3>Open questions</h3>
              <p>Unconfirmed verb forms, tense distinctions and spellings stay explicitly unresolved.</p>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
