import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "Language",
  description: "Explore the Mombasa Kutchi dictionary, emerging grammar, and draft writing system.",
};

const sections = [
  {
    number: "01",
    title: "Dictionary",
    description: "Look up words and meanings in our growing, community-reviewed record of spoken Kutchi.",
    href: "/dictionary",
    action: "Browse the dictionary",
  },
  {
    number: "02",
    title: "Grammar",
    description: "Explore example-based observations about word order, pronouns, verb forms, gender and number.",
    href: "/language/grammar",
    action: "Explore the grammar",
  },
  {
    number: "03",
    title: "Writing guide",
    description: "Learn about the developing Latin spelling conventions and the questions still being studied.",
    href: "/orthography",
    action: "Read the writing guide",
  },
];

export default function LanguagePage() {
  return (
    <PublicShell>
      <div className="page-width interior-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Language</span>
        </nav>
        <header className="page-intro language-hero">
          <p className="eyebrow">The language archive</p>
          <h1>A language in words, patterns and voices.</h1>
          <p>
            I am documenting the Kutchi I grew up speaking: the words we use,
            how they fit together, and how we can write them. This is my
            growing record of Mombasa Kutchi, not a finished grammar.
          </p>
        </header>
        <section aria-labelledby="language-explore">
          <div className="language-section-heading">
            <h2 id="language-explore">Explore the language</h2>
            <p>Three ways into the same living record.</p>
          </div>
          <div className="language-cards">
            {sections.map((section) => (
              <article className="language-card" key={section.href}>
                <span className="language-card__number">{section.number} / LANGUAGE</span>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <Link className="text-link" href={section.href}>
                  {section.action} <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="language-feature" aria-labelledby="language-feature-title">
          <div>
            <p className="eyebrow">From the grammar notebook</p>
            <h2 id="language-feature-title">One action, many forms.</h2>
            <p>
              As I compared the different forms of “to do,” I began to see
              how the verb changes with the subject. These are some of the
              examples that made me want to document our grammar.
            </p>
            <Link className="text-link" href="/language/grammar#verbs">
              See the examples <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="language-feature__examples">
            <p><strong>Kuroo kare(n)tho?</strong><span>What are you doing? · masculine</span></p>
            <p><strong>Kuroo kare(n)thi?</strong><span>What are you doing? · feminine</span></p>
            <p><strong>Mere sanas kare(n)thaa</strong><span>Everyone is defecating</span></p>
          </div>
        </section>

        <section className="language-research-promo" aria-labelledby="language-research-title">
          <div className="language-research-promo__copy">
            <p className="eyebrow">New / Language research</p>
            <h2 id="language-research-title">Ideas that begin with a sentence.</h2>
            <p>
              I wrote five research essays about the questions I have been
              working through—from ke and verb endings to noun plurals.
              Every claim is tied to the examples I recorded.
            </p>
            <Link className="button button--outline" href="/language/articles">
              Browse research articles <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <Link href="/language/articles" className="language-research-promo__image" aria-label="Explore language research articles">
            <Image src="/language/research/noun-relations.svg" alt="" width={1100} height={650} unoptimized />
          </Link>
        </section>
        <p className="language-method-note">
          <strong>A note on my research:</strong> I document the sentences I know
          as a native speaker. When an explanation is still a hypothesis, I
          say so and keep the examples available for further study.
        </p>
      </div>
    </PublicShell>
  );
}
