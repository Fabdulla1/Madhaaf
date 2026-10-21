import Image from "next/image";
import Link from "next/link";
import { PublicShell as PublicSiteResearchLayout } from "@/components/public/shell";
import type { ResearchArticle, ResearchBlock, ResearchExample } from "@/lib/language-articles";
import { dictionaryLookups, researchArticles } from "@/lib/language-articles";

function DictionaryLink({ word, lookup }: { word: string; lookup?: string }) {
  const search = lookup ?? word;
  return (
    <Link
      href={`/dictionary?q=${encodeURIComponent(search)}`}
      className="research-word-link"
      title={`Find “${search}” in the Kutchi dictionary`}
    >
      {word}
    </Link>
  );
}

/** Link only documented forms; do not turn unknown morphology into invented lemmas. */
function LinkedKutchi({ sentence }: { sentence: string }) {
  return (
    <>
      {sentence.split(/(\s+)/u).map((part, index) => {
        if (!part.trim()) return part;
        const match = /^([“"'‘]*)(.*?)([,.!?;:”“]*)$/u.exec(part);
        if (!match) return part;
        const [, prefix, word, suffix] = match;
        const lookup = dictionaryLookups[word.toLowerCase()];
        return lookup ? (
          <span key={index}>
            {prefix}<DictionaryLink word={word} lookup={lookup} />{suffix}
          </span>
        ) : <span key={index}>{part}</span>;
      })}
    </>
  );
}

function ExampleCard({ example }: { example: ResearchExample }) {
  return (
    <figure className="research-example">
      {example.context && <span className="research-example__context">{example.context}</span>}
      <blockquote lang="und" className="research-example__sentence">
        <LinkedKutchi sentence={example.kutchi} />
      </blockquote>
      <figcaption>{example.english}</figcaption>
    </figure>
  );
}

function ResearchBlockView({ block }: { block: ResearchBlock }) {
  switch (block.type) {
    case "text":
      return <p className="research-prose">{block.text}</p>;
    case "examples":
      return (
        <div className="research-example-group">
          {block.label && <p className="research-block-label">{block.label}</p>}
          <div className="research-example-grid">
            {block.items.map((example, index) => <ExampleCard example={example} key={index} />)}
          </div>
        </div>
      );
    case "table":
      return (
        <figure className="research-table-figure">
          <div className="research-table-scroll" tabIndex={0} role="region" aria-label="Scrollable grammatical comparison table">
            <table className="research-table">
              <thead>
                <tr>{block.headers.map((name, index) => <th scope="col" key={index}>{name}</th>)}</tr>
              </thead>
              <tbody>
                {block.rows.map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, column) => column === 0
                      ? <th scope="row" key={column}>{cell}</th>
                      : <td key={column}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case "finding":
      return (
        <aside className={`research-finding research-finding--${block.strength}`} aria-label={block.label}>
          <p className="research-finding__label">
            {block.strength === "attested" ? "Speaker evidence" : block.strength === "hypothesis" ? "Interpretation to test" : "Unresolved question"}
          </p>
          <h3>{block.label}</h3>
          <p>{block.text}</p>
        </aside>
      );
    case "questions":
      return (
        <div className="research-questions">
          <h3>What should we ask next?</h3>
          <ol>{block.items.map((item, index) => <li key={index}>{item}</li>)}</ol>
        </div>
      );
  }
}

export function ResearchIndex() {
  return (
    <PublicSiteResearchLayout>
      <div className="page-width interior-page research-index">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/language">Language</Link><span aria-hidden="true">/</span>
          <span aria-current="page">Research articles</span>
        </nav>
        <header className="research-index__intro">
          <p className="eyebrow">Madhaaf / Language research</p>
          <h1>What the sentences are teaching us.</h1>
          <p>
            Five illustrated studies of Mombasa Kutchi, grounded in examples
            supplied by a native speaker. Read them as an evolving descriptive
            grammar: confident observations are separated from hypotheses
            awaiting further testing.
          </p>
          <div className="research-index__meta"><span>Research series 01–05</span><span>Working analyses · October 2026</span></div>
        </header>
        <div className="research-index__feature">
          <div>
            <p className="eyebrow">Begin with the evidence</p>
            <h2>Every small word has a story.</h2>
            <p>
              Why does <em>ke</em> follow a boy in one sentence but a person
              experiencing desire in another? Our first study follows that question
              through attested contrasts and speaker judgments.
            </p>
            <Link className="button button--primary" href="/language/articles/what-ke-marks">
              Read the first study <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <Image
            src="/language/research/ke-relations.svg"
            alt=""
            width={1100}
            height={700}
            className="research-index__feature-image"
            priority
            unoptimized
          />
        </div>
        <section aria-labelledby="research-series-heading" className="research-index__series">
          <div className="research-index__series-heading">
            <h2 id="research-series-heading">Browse the series</h2>
            <p>Read an individual article, then follow its highlighted Kutchi words into the dictionary.</p>
          </div>
          <div className="research-index__grid">
            {researchArticles.map((article) => (
              <article className="research-tile" key={article.slug}>
                <Link href={`/language/articles/${article.slug}`} className="research-tile__art" aria-label={`Read ${article.title}`}>
                  <Image src={article.illustration} alt="" width={1200} height={680} unoptimized />
                  <span>{article.number}</span>
                </Link>
                <div className="research-tile__body">
                  <p className="research-tile__category">{article.subject}</p>
                  <h3><Link href={`/language/articles/${article.slug}`}>{article.title}</Link></h3>
                  <p>{article.summary}</p>
                  <Link className="text-link" href={`/language/articles/${article.slug}`}>
                    Read article <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        <div className="research-index__closing">
          <h2>Evidence first, rules second.</h2>
          <p>
            These articles are based on elicited Mombasa Kutchi examples. Alternative
            forms, conflicting translations and gaps are documented rather than
            smoothed away. Neither the series nor its illustrations claim to be
            a standardized or independently verified grammar.
          </p>
          <Link className="text-link" href="/language/grammar">Explore the grammar notebook ↗</Link>
        </div>
      </div>
    </PublicSiteResearchLayout>
  );
}


export function ResearchArticleView({ article }: { article: ResearchArticle }) {
  const index = researchArticles.findIndex((item) => item.slug === article.slug);
  const next = researchArticles[(index + 1) % researchArticles.length];
  return (
    <PublicSiteResearchLayout>
      <div className="page-width interior-page research-article-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/language">Language</Link><span aria-hidden="true">/</span>
          <Link href="/language/articles">Research articles</Link>
        </nav>
        <article className="research-article">
          <header className="research-article__header">
            <p className="eyebrow">Research study {article.number} / {article.subject}</p>
            <h1>{article.title}</h1>
            <p className="research-article__dek">{article.summary}</p>
            <div className="research-article__meta">
              <span>Madhaaf Language Research</span>
              <span>21 October 2026</span>
              <span>Descriptive working paper</span>
            </div>
          </header>
          <figure className="research-article__hero">
            <Image
              src={article.illustration}
              alt={article.illustrationAlt}
              width={1400}
              height={770}
              priority
              unoptimized
            />
            <figcaption>Original editorial illustration; not an archival photograph or linguistic source.</figcaption>
          </figure>
          <div className="research-article__layout">
            <nav className="research-article__toc" aria-label="Contents of this article">
              <span className="eyebrow">In this study</span>
              {article.sections.map((section, sectionIndex) => (
                <a href={`#${section.id}`} key={section.id}>
                  <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                  {section.title}
                </a>
              ))}
              <a href="#word-notes"><span>↗</span> Word notes</a>
              <a href="#source-and-method"><span>↗</span> Source and method</a>
            </nav>
            <div className="research-article__reading">
              <p className="research-article__lead">{article.introduction}</p>
              {article.sections.map((section, sectionIndex) => (
                <section className="research-article__section" id={section.id} key={section.id}>
                  <p className="research-article__number">Section {String(sectionIndex + 1).padStart(2, "0")}</p>
                  <h2>{section.title}</h2>
                  {section.blocks.map((block, blockIndex) => (
                    <ResearchBlockView key={blockIndex} block={block} />
                  ))}
                </section>
              ))}
              <section className="research-wordnotes" id="word-notes">
                <p className="eyebrow">A reading companion</p>
                <h2>Words in this study</h2>
                <p>
                  These meanings describe the usage in the recorded examples. Follow
                  each word to search the published dictionary; some entries may
                  still be under review.
                </p>
                <dl className="research-wordnotes__grid">
                  {article.wordNotes.map((item) => (
                    <div key={item.word}>
                      <dt><DictionaryLink word={item.word} lookup={item.search ?? item.word} /></dt>
                      <dd>{item.meaning}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section id="source-and-method" className="research-method">
                <p className="eyebrow">Source &amp; method</p>
                <h2>How this article was prepared</h2>
                <p>
                  Primary evidence: native-speaker Mombasa Kutchi examples and
                  grammaticality judgments supplied to the Madhaaf project in
                  October 2026, including the completed 48-sentence elicitation
                  questionnaire (Study 007) and prior verb and case studies.
                  Examples are presented as recorded, using the project&apos;s
                  agreed (n)-before-th display convention.
                </p>
                <p>
                  Interpretations marked as hypotheses remain open to correction.
                  This is a preliminary descriptive research article, not a
                  peer-reviewed paper or a claim about all Kutchi varieties.
                  No independent multi-speaker validation has yet been incorporated.
                </p>
              </section>
            </div>
          </div>
        </article>
        <div className="research-article__next">
          <div>
            <p className="eyebrow">Continue reading · Study {next.number}</p>
            <h2><Link href={`/language/articles/${next.slug}`}>{next.title} ↗</Link></h2>
          </div>
          <Link className="text-link" href="/language/articles">All research articles</Link>
        </div>
      </div>
    </PublicSiteResearchLayout>
  );
}
