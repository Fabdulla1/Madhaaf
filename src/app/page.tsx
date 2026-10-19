import Link from "next/link";
import { HomePreviews } from "@/components/public/home-previews";
import { PublicShell } from "@/components/public/shell";

export default function Home() {
  return (
    <PublicShell>
      <section className="hero">
        <div className="page-width hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">Kutchi Roots <span aria-hidden="true">/</span> Mombasa</p>
            <h1>Our people. Our words. Our story.</h1>
            <p className="hero__intro">
              A growing home for the words, memories, and histories of Mombasa
              Kutchi. Explore the public archive and the language as it is
              documented, one contribution at a time.
            </p>
            <div className="action-row">
              <Link className="button button--primary" href="/dictionary">
                Explore the dictionary <span aria-hidden="true">↗</span>
              </Link>
              <Link className="text-link" href="/history">
                Browse history <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-art__ring hero-art__ring--one" />
            <div className="hero-art__ring hero-art__ring--two" />
            <div className="hero-art__ring hero-art__ring--three" />
            <div className="hero-art__center">
              <span>WORDS</span>
              <span>MEMORY</span>
              <span>FAMILY</span>
            </div>
            <span className="hero-art__caption">An archive in the making</span>
          </div>
        </div>
      </section>

      <section className="intro-section section-space">
        <div className="page-width intro-grid">
          <p className="eyebrow">01 / The archive</p>
          <div>
            <h2>A place to hold what matters, with care.</h2>
            <p>
              Kutchi Roots begins with Mombasa Kutchi, the East African variety
              spoken in Mombasa. Its dictionary uses a developing Latin
              orthography. The family archive has different privacy needs, so
              access to those records is limited to authorized people.
            </p>
            <Link className="text-link" href="/orthography">
              How we write Mombasa Kutchi <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-space section-border">
        <div className="page-width">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / Language</p>
              <h2>Find a word. Follow its meaning.</h2>
            </div>
            <p>
              Search Mombasa Kutchi spellings or English meanings. An
              apostrophe and <code>(n)</code> are meaningful parts of the
              working spelling system.
            </p>
          </div>
          <form className="dictionary-search dictionary-search--home" action="/dictionary" method="get" role="search">
            <label htmlFor="home-word-search">Search the dictionary</label>
            <div className="search-field">
              <input id="home-word-search" name="q" type="search" placeholder="Word or meaning" />
              <button type="submit" aria-label="Search dictionary">Search <span aria-hidden="true">↗</span></button>
            </div>
          </form>
          <HomePreviews kind="dictionary" />
        </div>
      </section>

      <section className="section-space family-section">
        <div className="page-width family-grid">
          <div className="family-illustration" aria-hidden="true">
            <span className="family-illustration__line" />
            <span className="family-illustration__node family-illustration__node--one" />
            <span className="family-illustration__node family-illustration__node--two" />
            <span className="family-illustration__node family-illustration__node--three" />
            <span className="family-illustration__node family-illustration__node--four" />
          </div>
          <div>
            <p className="eyebrow">03 / Family</p>
            <h2>Every connection deserves context.</h2>
            <p>
              The family tree brings biographies, relationships, and memories
              together. Family information is private by default and available
              only to authorized people.
            </p>
            <Link className="button button--outline" href="/family">
              About the family space <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-space section-border">
        <div className="page-width">
          <div className="section-heading">
            <div>
              <p className="eyebrow">04 / History &amp; culture</p>
              <h2>Stories with sources.</h2>
            </div>
            <p>
              An editorial home for community histories, oral traditions, and
              cultural practices as documented material becomes available.
            </p>
          </div>
          <HomePreviews kind="history" />
          <Link className="text-link section-end-link" href="/history">
            Explore history &amp; culture <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <section className="closing-note">
        <div className="page-width">
          <p className="eyebrow">The work continues</p>
          <h2>Preservation begins with listening.</h2>
          <p>
            As this archive grows, each word and story can carry its own
            spelling, sources, attribution, and context.
          </p>
          <Link className="text-link" href="/orthography">
            Learn about the writing guide <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
