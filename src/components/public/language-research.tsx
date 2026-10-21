import Image from "next/image";
import Link from "next/link";
import { PublicShell as PublicSiteResearchLayout } from "@/components/public/shell";
import type { ResearchArticle, ResearchBlock, ResearchExample } from "@/lib/language-articles";
import { dictionaryLookups, researchArticles } from "@/lib/language-articles";

function editorialDateLabel(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

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

function noteId(word: string) {
  return `word-note-${word.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

/** Link attested forms to a guaranteed contextual definition before searching the dictionary. */
function LinkedKutchi({ sentence, article }: { sentence: string; article: ResearchArticle }) {
  return (
    <>
      {sentence.split(/(\s+)/u).map((part, index) => {
        if (!part.trim()) return part;
        const match = /^([“"'‘]*)(.*?)([,.!?;:”“]*)$/u.exec(part);
        if (!match) return part;
        const [, prefix, word, suffix] = match;
        const lookup = dictionaryLookups[word.toLowerCase()];
        if (!lookup) return <span key={index}>{part}</span>;
        // Surface forms can share a lemma; retain their separate contextual definitions.
        const note = article.wordNotes.find((item) => item.word.toLowerCase() === word.toLowerCase())
          ?? article.wordNotes.find((item) => (item.search ?? item.word).toLowerCase() === lookup.toLowerCase());
        return (
          <span key={index}>
            {prefix}{note
              ? <a className="research-word-link" href={`#${noteId(note.word)}`} title={`Read the meaning of ${note.word} in this article`}>{word}</a>
              : <DictionaryLink word={word} lookup={lookup} />}{suffix}
          </span>
        );
      })}
    </>
  );
}

function ExampleCard({ example, article }: { example: ResearchExample; article: ResearchArticle }) {
  return (
    <figure className="research-example">
      {example.context && <span className="research-example__context">{example.context}</span>}
      <blockquote lang="und" className="research-example__sentence">
        <LinkedKutchi sentence={example.kutchi} article={article} />
      </blockquote>
      <figcaption>
        {example.captionKind && (
          <strong className="research-example__structure-label">
            {example.captionKind === "structure" ? "Constituent order · " : "Elicitation context · "}
          </strong>
        )}
        {example.english}
      </figcaption>
    </figure>
  );
}

function ResearchBlockView({ block, article }: { block: ResearchBlock; article: ResearchArticle }) {
  switch (block.type) {
    case "text":
      return <p className="research-prose">{block.text}</p>;
    case "examples":
      return (
        <div className="research-example-group">
          {block.label && <p className="research-block-label">{block.label}</p>}
          <div className="research-example-grid">
            {block.items.map((example, index) => <ExampleCard example={example} article={article} key={index} />)}
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
          <h3>Questions for further elicitation</h3>
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
          <h1>Research on East African Kutchi.</h1>
          <p>
            These studies document Mombasa and Ethiopian Kutchi through
            recorded sentences, translations and preliminary grammatical
            analysis. Speaker-confirmed evidence is distinguished from
            interpretations that still need testing.
          </p>
          <div className="research-index__meta">
            <span><Link href="/about">By Farhan Abdulla</Link></span>
            <span>Research series · 2026 editorial dates</span>
            <span>First published online October 2026</span>
          </div>
        </header>
        <section className="research-index__latest" aria-labelledby="research-latest-heading">
          <div className="research-index__latest-heading">
            <p className="eyebrow">Latest language studies</p>
            <h2 id="research-latest-heading">Recent studies</h2>
          </div>
          <div className="research-index__latest-links">
            {researchArticles.slice(-2).map((article) => (
              <Link href={`/language/articles/${article.slug}`} key={article.slug}>
                <span className="research-index__latest-number">Study {article.number}</span>
                <strong>{article.title}</strong>
                <span className="research-index__latest-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
        <div className="research-index__feature">
          <div>
            <p className="eyebrow">Begin with the evidence</p>
            <h2>What does ke mark?</h2>
            <p>
              The particle <em>ke</em> occurs in several grammatical
              environments. This study compares recorded examples before
              proposing how its uses may be related.
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
            <p>Browse the studies and follow highlighted Kutchi words to their contextual meanings and dictionary entries.</p>
          </div>
          <div className="research-index__grid">
            {researchArticles.map((article) => (
              <article className="research-tile" key={article.slug}>
                <Link href={`/language/articles/${article.slug}`} className="research-tile__art" aria-label={`Read ${article.title}`}>
                  <Image src={article.illustration} alt="" width={1200} height={680} unoptimized />
                  <span>{article.number}</span>
                </Link>
                <div className="research-tile__body">
                  <p className="research-tile__category">{article.subject} <span aria-hidden="true">/</span> <time dateTime={article.editorialDate}>{editorialDateLabel(article.editorialDate)}</time></p>
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
            The studies preserve alternatives that do not fit a single
            grammatical rule. Questions remain open where evidence is
            insufficient. The displayed issue dates are retrospective
            editorial dates; the pages first appeared online in October 2026.
          </p>
          <Link className="text-link" href="/language/grammar">Explore the grammar</Link>
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
              <span>By <Link href="/about">Farhan Abdulla</Link></span>
              <span>Research issue <time dateTime={article.editorialDate}>{editorialDateLabel(article.editorialDate)}</time></span>
              <span>Preliminary research article · First published online October 2026</span>
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
                    <ResearchBlockView key={blockIndex} block={block} article={article} />
                  ))}
                </section>
              ))}
              <section className="research-wordnotes" id="word-notes">
                <p className="eyebrow">Lexical notes</p>
                <h2>Words in this study</h2>
                <p>
                  Word notes record meanings in their sentence contexts.
                  Select a word for its contextual meaning and to search
                  the public dictionary. Some entries remain under review.
                </p>
                <dl className="research-wordnotes__grid">
                  {article.wordNotes.map((item) => (
                    <div key={item.word}>
                      <dt id={noteId(item.word)}><DictionaryLink word={item.word} lookup={item.search ?? item.word} /></dt>
                      <dd>{item.meaning}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              <section id="source-and-method" className="research-method">
                <p className="eyebrow">Source &amp; method</p>
                <h2>How this article was prepared</h2>
                <p>
                  The published material includes native-speaker sentences,
                  translation pairs and grammaticality judgments, including
                  a 48-sentence questionnaire (Study 007), earlier verb and
                  case comparisons, and targeted studies of possession and
                  negation (Studies 008–011). Original forms remain visible,
                  with a working (n)-before-th display spelling where indicated.
                </p>
                <p>
                  These analyses are preliminary, not claims about every
                  Kutchi speaker or variety. Evidence from Mombasa is not
                  automatically treated as confirmation for Ethiopian Kutchi.
                  The research has not been peer reviewed or independently
                  validated across multiple speakers. Issue dates organize
                  the 2026 series and do not indicate earlier online
                  publication; the articles first appeared online in October 2026.
                </p>
              </section>
            </div>
          </div>
        </article>
        <div className="research-article__next">
          <div>
            <p className="eyebrow">Continue reading · Study {next.number}</p>
            <h2><Link href={`/language/articles/${next.slug}`}>{next.title}</Link></h2>
          </div>
          <Link className="text-link" href="/language/articles">All research articles</Link>
        </div>
      </div>
    </PublicSiteResearchLayout>
  );
}
