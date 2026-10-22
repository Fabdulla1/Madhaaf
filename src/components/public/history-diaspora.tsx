import Image from "next/image";
import Link from "next/link";
import { diasporaStudy, diasporaSections, diasporaSources, diasporaEvidence, diasporaBohraResidents, diasporaArchiveCoverage } from "@/lib/history-diaspora";
import { diasporaMapStages } from "@/lib/diaspora-map";
import { DiasporaMap } from "./diaspora-map";

function Citations({ refs }: { refs?: number[] }) {
  if (!refs?.length) return null;
  return <sup className="diaspora-citations">{refs.map((ref) => <a key={ref} href={`#source-${ref}`} aria-label={`Source ${ref}`}>[{ref}]</a>)}</sup>;
}

function HistoricalFigure({ kind }: { kind: "mombasa" | "harar" }) {
  return kind === "mombasa" ? (
    <figure className="diaspora-figure">
      <Image src="/history/diaspora/kilindini-1898.jpg" alt="An illustration of a veranda-fronted house and garden at Kilindini, Mombasa, published in 1898." width={1341} height={1087} />
      <figcaption><strong>Figure 2. Kilindini in a colonial publication.</strong> The administrator&apos;s house, from W. W. A. Fitz Gerald&apos;s <cite>Travels in the Coastlands of British East Africa</cite> (1898). This depicts a colonial building, not a Kutchi household. British Library digitisation; <a href="#image-credits">source and rights</a>.</figcaption>
    </figure>
  ) : (
    <figure className="diaspora-figure">
      <Image src="/history/diaspora/harar-house.webp" alt="The wooden galleries, carved panels and open doorway of the house now used as the Rimbaud Museum in Harar." width={1500} height={1030} />
      <figcaption><strong>Figure 3. A house in Harar&apos;s historic urban landscape.</strong> The building now known as the Rimbaud Museum, photographed by Sailko in 2018. The photograph provides architectural context; it does not establish a Kutchi builder or show Syaram&apos;s inscription. <a href="#image-credits">Attribution and licence</a>.</figcaption>
    </figure>
  );
}

export function DiasporaHistoryFeature() {
  return (
    <section className="diaspora-feature" aria-labelledby="diaspora-feature-title">
      <Link href={`/history/${diasporaStudy.slug}`} className="diaspora-feature__image" aria-label={`Read ${diasporaStudy.title}`}>
        <Image src="/history/diaspora/mandvi-shipbuilding.jpg" alt="A wooden ship under construction at Mandvi, Kutch; a modern photograph." width={800} height={500} />
      </Link>
      <div>
        <p className="eyebrow">History study 01 / Diaspora</p>
        <h2 id="diaspora-feature-title"><Link href={`/history/${diasporaStudy.slug}`}>{diasporaStudy.title}</Link></h2>
        <p>{diasporaStudy.summary}</p>
        <p className="diaspora-feature__meta">Farhan Abdulla · 22 October 2026 · {diasporaSources.length} sources</p>
        <Link className="text-link" href={`/history/${diasporaStudy.slug}`}>Read the study and explore the map</Link>
      </div>
    </section>
  );
}

export function DiasporaHistoryArticle() {
  const canonical = `https://madhaaf.vercel.app/history/${diasporaStudy.slug}`;
  const structuredData = {
    "@context": "https://schema.org", "@type": "Article",
    headline: diasporaStudy.title, description: diasporaStudy.summary,
    author: { "@type": "Person", name: diasporaStudy.author, url: "https://madhaaf.vercel.app/about" },
    datePublished: diasporaStudy.published, dateModified: diasporaStudy.published,
    mainEntityOfPage: canonical, inLanguage: "en", genre: "Historical research synthesis",
    image: ["mandvi-shipbuilding.jpg", "kilindini-1898.jpg", "harar-house.webp"].map((name) => `https://madhaaf.vercel.app/history/diaspora/${name}`),
    citation: diasporaSources.map((source) => source.url),
  };
  return (
    <article className="diaspora-study">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <header className="page-width diaspora-header">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/history">History &amp; culture</Link><span>/</span><span>Diaspora</span></nav>
        <div className="diaspora-header__grid">
          <div>
            <p className="eyebrow">Madhaaf / History study 01</p>
            <h1>{diasporaStudy.title}</h1>
            <p className="diaspora-deck">{diasporaStudy.summary}</p>
            <div className="diaspora-byline"><Link href="/about" rel="author">{diasporaStudy.author}</Link><span>Published <time dateTime={diasporaStudy.published}>22 October 2026</time></span></div>
            <p className="diaspora-status">Historical research synthesis · Open references · Not independently peer reviewed</p>
            <a href="#migration-map-title" className="text-link">Explore the migration map</a>
          </div>
          <figure>
            <Image src="/history/diaspora/mandvi-shipbuilding.jpg" alt="Timbers and the tall wooden hull of a ship being built at Mandvi in Kutch." width={800} height={500} preload />
            <figcaption><strong>Figure 1. Shipbuilding at Mandvi.</strong> A modern photograph, uploaded in 2008, showing the maritime setting of Kutch. It is not an image of a nineteenth-century migration voyage. <a href="#image-credits">Credit and licence</a>.</figcaption>
          </figure>
        </div>
      </header>

      <div className="page-width diaspora-reading-layout">
        <aside className="diaspora-contents">
          <nav aria-label="Article contents"><p className="eyebrow">In this study</p><ol>{diasporaSections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title.replace(/^\d+\. /, "")}</a></li>)}<li><a href="#archive-coverage">Archival coverage</a></li><li><a href="#sources">Sources and evidence</a></li></ol></nav>
        </aside>
        <div className="diaspora-reading">
          <section className="diaspora-abstract" aria-labelledby="diaspora-abstract-title"><h2 id="diaspora-abstract-title">Abstract</h2><p>{diasporaStudy.abstract}</p><p className="diaspora-keywords"><strong>Keywords:</strong> Kutch, Kutchi diaspora, Mombasa, Kenya, Ethiopia, Zanzibar, Indian Ocean, migration</p></section>
          <section className="diaspora-evidence" aria-labelledby="evidence-title">
            <h2 id="evidence-title">The chronology and its limits</h2>
            <div className="diaspora-table-scroll" role="region" aria-label="Evidence chronology; scroll horizontally on small screens" tabIndex={0}>
              <table><caption>What each period establishes</caption><thead><tr><th scope="col">Period</th><th scope="col">Evidence</th><th scope="col">Limit</th></tr></thead><tbody>{diasporaEvidence.map((row) => <tr key={row.period}><th scope="row">{row.period}</th><td>{row.evidence}<Citations refs={row.refs} /></td><td>{row.limit}</td></tr>)}</tbody></table>
            </div>
          </section>
          {diasporaSections.map((section, index) => (
            <section className="diaspora-section" id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.paragraphs.map((paragraph, p) => <p key={p}>{paragraph.text}<Citations refs={paragraph.refs} /></p>)}
              {section.image && <HistoricalFigure kind={section.image} />}
              {index === 2 && <>
                <div className="diaspora-evidence" aria-labelledby="bohra-residents-title">
                  <h3 id="bohra-residents-title">Recorded Bohra residents, 1870<Citations refs={[36]} /></h3>
                  <div className="diaspora-table-scroll" role="region" aria-label="Bohra population table; scroll horizontally on small screens" tabIndex={0}>
                    <table>
                      <caption>Selected coastal entries from the 1870 Zanzibar Agency statistics, reproduced in Saldanha (1906), p. 15.</caption>
                      <thead><tr><th scope="col">Place</th><th scope="col">Adult men</th><th scope="col">Adult women</th><th scope="col">Children</th><th scope="col">Total</th><th scope="col">Houses</th></tr></thead>
                      <tbody>{diasporaBohraResidents.map((row) => <tr key={row.place}><th scope="row">{row.place}</th><td>{row.men}</td><td>{row.women}</td><td>{row.children}</td><td>{row.total}</td><td>{row.houses}</td></tr>)}</tbody>
                    </table>
                  </div>
                  <p>The table records a religious community. It does not supply a Kutchi population count. Houses retain the source&apos;s meaning and are not counted as families.</p>
                </div>
                <DiasporaMap />
                <details className="diaspora-transcript"><summary>Read all map connections as text</summary>{diasporaMapStages.map((stage) => <section key={stage.title}><h3>{stage.period}: {stage.title}</h3><p>{stage.description}</p><ul>{stage.routes.map((route) => <li key={route.label}><strong>{route.label}.</strong> {route.note}<Citations refs={route.refs} /></li>)}</ul></section>)}</details>
              </>}
            </section>
          ))}
          <section className="diaspora-section" id="archive-coverage" aria-labelledby="archive-coverage-title">
            <h2 id="archive-coverage-title">Archival coverage and remaining work</h2>
            <p>This investigation draws on publicly retrievable records checked on 22 October 2026. The register below distinguishes material inspected from holdings that need further retrieval. It does not claim a complete inventory of surviving evidence.</p>
            <details className="diaspora-transcript">
              <summary>Read the search coverage and outstanding records</summary>
              {diasporaArchiveCoverage.map((area) => <section key={area.area}><h3>{area.area}</h3><p>{area.inspected}</p><p>{area.further}</p></section>)}
            </details>
          </section>
          <section className="diaspora-bibliography" id="sources" aria-labelledby="sources-title">
            <p className="eyebrow">References / Evidence register</p><h2 id="sources-title">Sources and evidence</h2>
            <p>Numbered references connect the text and map to the material consulted. Access checked 22 October 2026. Access limits are recorded individually. These sources differ in purpose and scope; their categories and claims need to be read in that context.</p>
            <ol>{diasporaSources.map((source) => <li id={`source-${source.id}`} key={source.id}><span className="diaspora-source-kind">{source.kind}</span><p><a href={source.url} rel="noopener noreferrer">{source.citation}</a></p><p className="diaspora-source-note">{source.note}</p></li>)}</ol>
          </section>
          <section className="diaspora-credits" id="image-credits" aria-labelledby="credits-title">
            <h2 id="credits-title">Image and map credits</h2>
            <ul>
              <li><strong>Figure 1:</strong> Camaal Mustafa Sikan… (credit as recorded by the source), <a href="https://commons.wikimedia.org/wiki/File:Mandvi_Ship_Making_-_panoramio.jpg" rel="noopener noreferrer">Mandvi Ship Making</a>, originally uploaded 19 April 2008. <a href="https://creativecommons.org/licenses/by/3.0/" rel="noopener noreferrer">CC BY 3.0</a>. Reproduced without alteration; the header uses a display crop.</li>
              <li><strong>Figure 2:</strong> <a href="https://commons.wikimedia.org/wiki/File:The_Administrator%27s_house,_Kilindini_-_Mombasa,_from_1898_book.jpg" rel="noopener noreferrer">British Library digitised illustration</a> from Fitz Gerald&apos;s 1898 book, scan page 445, shelfmark Digital Store 010095.f.6. The British Library&apos;s Flickr Commons release records <a href="https://www.flickr.com/commons/usage/" rel="noopener noreferrer">no known copyright restrictions</a>. Reproduced without alteration.</li>
              <li><strong>Figure 3:</strong> Sailko, <a href="https://commons.wikimedia.org/wiki/File:Harar,_casa_di_rimbaud,_05.jpg" rel="noopener noreferrer">Harar, casa di Rimbaud, 05</a>, 8 November 2018. <a href="https://creativecommons.org/licenses/by/3.0/" rel="noopener noreferrer">CC BY 3.0</a>. Resized and converted to WebP; no content changes.</li>
              <li><strong>Map:</strong> Natural Earth <a href="https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/" rel="noopener noreferrer">1:110m land</a>, public domain. Coastlines simplified for this display. Connections are editorial interpretations tied to the numbered sources, with no claim to exact historical tracks, boundaries or migration volumes.</li>
            </ul>
            <p className="diaspora-cite-this"><strong>Cite this article:</strong> Abdulla, Farhan. 2026. “{diasporaStudy.title}.” Madhaaf, 22 October. <a href={canonical}>{canonical}</a>.</p>
          </section>
          <p className="diaspora-return"><Link className="text-link" href="/history">Back to history and culture</Link><a href="#diaspora-abstract-title">Back to the study</a></p>
        </div>
      </div>
    </article>
  );
}
