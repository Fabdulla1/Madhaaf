import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "Language",
  description: "Research on the language of Mombasa and Ethiopian Kutchi communities, including dictionary, grammar and writing conventions.",
};

const sections = [
  {
    number: "01",
    title: "Dictionary",
    description: "Consult documented words, meanings and speaker examples, with entries reviewed before publication.",
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
          <p className="eyebrow">East African Kutchi / Language research</p>
          <h1>Studying Mombasa and Ethiopian Kutchi.</h1>
          <p>
            This section documents vocabulary, sentence patterns and spoken
            usage in Mombasa and Ethiopian Kutchi communities. Analyses
            remain provisional and are supported by recorded examples.
          </p>
        </header>
        <section aria-labelledby="language-explore">
          <div className="language-section-heading">
            <h2 id="language-explore">Explore the language</h2>
            <p>Dictionary entries, grammatical analyses and writing conventions.</p>
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
            <p className="eyebrow">From the grammar studies</p>
            <h2 id="language-feature-title">One action, many forms.</h2>
            <p>
              The attested forms of “to do” suggest differences connected
              with grammatical person and gender. Further speaker comparisons
              are needed to establish the complete pattern.
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
            <h2 id="language-research-title">Studies grounded in speaker examples.</h2>
            <p>
              These articles examine the roles of ke, la and jo, verb endings,
              noun forms and negation. Each analysis distinguishes attested
              speaker examples from hypotheses that require further testing.
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
          <strong>Evidence and method:</strong> Recorded speaker examples and
          translations are preserved as supplied. Proposed grammatical rules
          are labeled as interpretations until further evidence supports them.
        </p>
      </div>
    </PublicShell>
  );
}
