import Link from "next/link";
import Image from "next/image";
import { PublicShell } from "@/components/public/shell";

export default function Home() {
  return (
    <PublicShell>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="page-width home-hero__grid">
          <div className="home-hero__copy">
            <h1 id="home-title">Documenting Mombasa and Ethiopian Kutchi.</h1>
            <p>
              Madhaaf is a research archive documenting Kutchi language, family
              history and cultural knowledge in Mombasa and Ethiopian communities.
              The aim is to record the evidence, its sources and the questions
              that remain open.
            </p>
            <div className="action-row">
              <Link className="button home-hero__button" href="/history">
                Explore the research <span aria-hidden="true">↗</span>
              </Link>
              <Link className="home-hero__quiet-link" href="#the-journey">
                Explore the archive <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>
          <div className="home-hero__art" aria-hidden="true">
            <div className="home-hero__halo home-hero__halo--outer" />
            <div className="home-hero__halo home-hero__halo--inner" />
            <div className="home-hero__sun" />
            <div className="home-hero__path home-hero__path--one" />
            <div className="home-hero__path home-hero__path--two" />
            <div className="home-hero__path home-hero__path--three" />
            <span className="home-hero__point home-hero__point--one" />
            <span className="home-hero__point home-hero__point--two" />
            <span className="home-hero__point home-hero__point--three" />
            <span className="home-hero__art-caption">Language, history and community</span>
          </div>
        </div>
        <div className="page-width home-hero__foot">
          <span>Language</span><span>Family</span><span>History</span>
        </div>
      </section>

      <section id="the-journey" className="home-intro" aria-labelledby="home-intro-title">
        <div className="page-width home-intro__grid">
          <span className="home-intro__mark" aria-hidden="true" />
          <div>
            <h2 id="home-intro-title">A record built from language and history.</h2>
            <p>
              This work brings together spoken examples, grammatical analysis,
              oral histories and genealogical records. Original forms are
              preserved, and interpretations remain separate from documented evidence.
            </p>
          </div>
        </div>
      </section>

      <section className="home-support" aria-labelledby="home-support-title">
        <div className="page-width home-support__inner">
          <div className="home-support__copy">
            <p className="eyebrow">Research support</p>
            <h2 id="home-support-title">Research and technical support</h2>
            <p>
              TokenWorks supports the development of Madhaaf&apos;s research
              infrastructure, including the dictionary, language studies
              and cultural archive.
            </p>
            <a className="text-link" href="https://www.tokenworks.ai/" rel="noopener noreferrer">
              Meet TokenWorks <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="home-support__brand">
            <Image src="/tokenworks-logo.png" width={160} height={160} alt="" />
            <span>TokenWorks</span>
          </div>
        </div>
      </section>

      <section className="home-chapters" aria-label="Explore the archive">
        <div className="page-width">
          <article className="home-chapter home-chapter--language">
            <div className="home-chapter__copy">
              <h2>Documenting the language</h2>
              <p>
                The dictionary records attested words, translations and usage.
                The grammar studies examine sentence patterns, while the writing
                guide sets out provisional Latin spelling conventions.
              </p>
              <div className="home-chapter__links">
                <Link className="text-link" href="/language">Explore the language <span aria-hidden="true">↗</span></Link>
                <Link className="text-link" href="/language/grammar">Discover the grammar <span aria-hidden="true">↗</span></Link>
                <Link className="text-link" href="/language/articles">Read language research <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
            <div className="home-chapter__art home-chapter__art--language" aria-hidden="true">
              <span className="home-language-mark home-language-mark--one" />
              <span className="home-language-mark home-language-mark--two" />
              <span className="home-language-mark home-language-mark--three" />
              <span className="home-language-mark home-language-mark--four" />
              <span className="home-art-label">Words / examples / analysis</span>
            </div>
          </article>

          <article className="home-chapter home-chapter--family">
            <div className="home-chapter__copy">
              <h2>Family and genealogical records</h2>
              <p>
                Family records document relationships across generations.
                Only information reviewed and approved for publication is
                visible publicly. Private family data remains restricted.
              </p>
              <Link className="text-link" href="/family">Explore the family space <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="home-chapter__art home-chapter__art--family" aria-hidden="true">
              <span className="home-family-line home-family-line--trunk" />
              <span className="home-family-line home-family-line--left" />
              <span className="home-family-line home-family-line--right" />
              <span className="home-family-node home-family-node--one" />
              <span className="home-family-node home-family-node--two" />
              <span className="home-family-node home-family-node--three" />
              <span className="home-family-node home-family-node--four" />
              <span className="home-art-label">Family relationships and sources</span>
            </div>
          </article>

          <article className="home-chapter home-chapter--history">
            <div className="home-chapter__copy">
              <h2>History and oral traditions</h2>
              <p>
                Historical accounts, oral testimony and photographs are
                presented with their sources and context. Where claims cannot
                yet be verified, that uncertainty is recorded.
              </p>
              <Link className="text-link" href="/history">Read the histories <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="home-chapter__art home-chapter__art--history" aria-hidden="true">
              <span className="home-history-frame home-history-frame--back" />
              <span className="home-history-frame home-history-frame--front" />
              <span className="home-history-sun" />
              <span className="home-history-horizon" />
              <span className="home-art-label">Documented accounts and context</span>
            </div>
          </article>
        </div>
      </section>

      <section className="home-closing" aria-labelledby="home-closing-title">
        <div className="page-width home-closing__grid">
          <span className="home-closing__mark" aria-hidden="true" />
          <div>
            <h2 id="home-closing-title">An archive that can be examined and expanded</h2>
            <p>
              Madhaaf studies the Kutchi spoken in Mombasa and Ethiopian
              communities. The material is developing, and publication depends
              on source review, evidence and the appropriate permissions.
            </p>
            <Link className="button button--outline" href="/about">About the research <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
