import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "About Madhaaf | East African Kutchi research",
  description:
    "Madhaaf documents Mombasa and Ethiopian Kutchi through linguistic research, speaker examples, oral histories and cultural records.",
  alternates: { canonical: "/about" },
};

const themes = [
  {
    number: "01",
    title: "Vocabulary and usage",
    body:
      "The dictionary records words, meanings, grammatical information and examples in context. Original speaker spellings remain part of the evidence.",
    href: "/dictionary",
    link: "Explore the dictionary",
  },
  {
    number: "02",
    title: "Grammar and language comparison",
    body:
      "The research examines word order, agreement, negation and case marking. Gujarati, Sindhi and other related languages provide comparisons, not substitutes for Kutchi evidence.",
    href: "/language/articles",
    link: "Read the language studies",
  },
  {
    number: "03",
    title: "History and oral records",
    body:
      "Family histories, migration accounts and cultural practices are documented with their sources. Oral traditions and historical findings are distinguished.",
    href: "/history",
    link: "Explore the history archive",
  },
];

export default function AboutPage() {
  return (
    <PublicShell>
      <div className="page-width interior-page about-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <span aria-current="page">About</span>
        </nav>
        <header className="about-hero">
          <div className="about-hero__copy">
            <p className="eyebrow">About Madhaaf / Research scope</p>
            <h1>Recording Mombasa and Ethiopian Kutchi.</h1>
            <p className="about-hero__intro">
              Madhaaf is an academic research and documentation project
              focused on the language, history and cultural knowledge
              of Kutchi communities in Mombasa and Ethiopia.
            </p>
            <p className="about-hero__signature">Farhan Abdulla <span>Founder and researcher</span></p>
          </div>
          <figure className="about-hero__art">
            <Image
              src="/language/research/connected-clauses.svg"
              width={1200}
              height={700}
              alt=""
              priority
              unoptimized
            />
            <figcaption>Language, family and history. Original editorial illustration, not historical evidence.</figcaption>
          </figure>
        </header>
        <div className="about-opening">
          <p className="about-opening__eyebrow">Purpose</p>
          <div>
            <h2>Document the language as it is spoken.</h2>
            <p>
              Kutchi speech, family histories and cultural traditions in East
              Africa are not always represented in written records. Madhaaf
              brings these materials together so they can be studied,
              compared and preserved with their original context.
            </p>
            <p>
              The project is not an attempt to prescribe a single correct
              form of Kutchi. It records speaker usage, variant forms and
              unresolved questions. Each analysis is revised as further
              evidence becomes available.
            </p>
          </div>
        </div>
        <section className="about-diaspora" aria-labelledby="about-roots-title">
          <div className="about-diaspora__heading">
            <p className="eyebrow">Geographic focus</p>
            <h2 id="about-roots-title">Kutchi communities in East Africa.</h2>
          </div>
          <div className="about-diaspora__copy">
            <p>
              The study focuses on Kutchi associated with <strong>Mombasa, Kenya,
              and communities in Ethiopia</strong>. It also records oral and
              family accounts of migration from the Kutch region. These
              accounts are important historical sources, but their dates
              and details require independent evaluation where possible.
            </p>
            <p>
              East African Kutchi may differ from varieties spoken in Kutch
              today. Contact with other languages, movement between communities
              and generational change are questions for investigation.
              Comparisons with Gujarati, Sindhi and documented Kutchi varieties
              help identify patterns without assuming that their grammar
              describes Mombasa or Ethiopian speech exactly.
            </p>
            <p>
              Current published examples are presented with their available
              speaker context. A pattern attested in Mombasa Kutchi is not
              automatically treated as established for Ethiopian Kutchi.
            </p>
          </div>
        </section>
        <section className="about-work" aria-labelledby="about-research-title">
          <div className="about-work__heading">
            <div>
              <p className="eyebrow">Research areas</p>
              <h2 id="about-research-title">Language, culture and history.</h2>
            </div>
            <p>
              Madhaaf combines language documentation with historical and
              cultural research. The dictionary, grammar and archive are
              connected but preserve their own sources and methods.
            </p>
          </div>
          <div className="about-work__grid">
            {themes.map((theme) => (
              <article className="about-work__card" key={theme.number}>
                <span>{theme.number} / RESEARCH</span>
                <h3>{theme.title}</h3>
                <p>{theme.body}</p>
                <Link className="text-link" href={theme.href}>{theme.link} <span aria-hidden="true">↗</span></Link>
              </article>
            ))}
          </div>
          <div className="about-work__note">
            <p className="eyebrow">Research method</p>
            <p>
              The linguistic studies begin with recorded or elicited speaker
              sentences, translations and grammaticality judgments. Each study
              distinguishes speaker-confirmed forms from interpretations that
              still require testing. Original spellings remain visible; a
              provisional Latin orthography supports consistent indexing.
            </p>
            <Link className="text-link" href="/orthography">Read the working writing guide <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
        <section className="about-vision" aria-labelledby="about-future-title">
          <p className="eyebrow">Research goals</p>
          <h2 id="about-future-title">Build a record that future research can use.</h2>
          <p>
            The long-term aim is to publish documented vocabulary, grammatical
            descriptions, speech examples and cultural histories with clear
            provenance. Further recordings, comparative studies and
            computational tools can extend this work as evidence and
            community participation grow.
          </p>
        </section>
        <section className="about-support" aria-labelledby="about-support-title">
          <div>
            <p className="eyebrow">Acknowledgments</p>
            <h2 id="about-support-title">Research and technical support.</h2>
            <p>
              Madhaaf was founded by <strong>Farhan Abdulla</strong> and is
              supported by <strong>TokenWorks LLC</strong>, co-founded by
              Farhan Abdulla and <strong>Adam Anderson</strong>.
              TokenWorks supports the development of the archive, research
              infrastructure and computational tools.
            </p>
            <p>
              Technical support does not imply that the findings have been
              peer reviewed or endorsed by an academic institution.
              Contributors and source material should be credited in the
              records where they are used.
            </p>
            <a className="text-link" href="https://www.tokenworks.ai/" rel="noopener noreferrer">
              Visit TokenWorks <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="about-support__brand">
            <Image src="/tokenworks-logo.png" alt="TokenWorks logo" width={150} height={150} />
            <strong>TokenWorks LLC</strong>
            <span>Supporting East African Kutchi research and documentation</span>
          </div>
        </section>
        <footer className="about-endnote">
          <p>
            Madhaaf documents selected Mombasa and Ethiopian Kutchi communities,
            not every Kutchi variety. Its analyses are preliminary unless
            stated otherwise. Uncertainty, differing speaker judgments and
            incomplete historical evidence remain part of the published record.
          </p>
          <Link className="button button--primary" href="/language/articles">
            Read the language studies <span aria-hidden="true">↗</span>
          </Link>
        </footer>
      </div>
    </PublicShell>
  );
}
