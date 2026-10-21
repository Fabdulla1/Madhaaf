import Link from "next/link";
import Image from "next/image";
import { PublicShell } from "@/components/public/shell";

export default function Home() {
  return (
    <PublicShell>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="page-width home-hero__grid">
          <div className="home-hero__copy">
            <h1 id="home-title">What we carry, we can keep.</h1>
            <p>
              A language heard at home. A family connection remembered. A story
              passed from one generation to the next. Madhaaf gives these
              pieces of our shared history a place to live and grow.
            </p>
            <div className="action-row">
              <Link className="button home-hero__button" href="/history">
                Explore our stories <span aria-hidden="true">↗</span>
              </Link>
              <Link className="home-hero__quiet-link" href="#the-journey">
                Discover the archive <span aria-hidden="true">↓</span>
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
            <span className="home-hero__art-caption">Many lives, one unfolding story</span>
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
            <h2 id="home-intro-title">Every story begins somewhere.</h2>
            <p>
              It might begin with a familiar phrase, a relative’s name, or a
              memory of a place. Here, those threads become a growing record of
              language and belonging, gathered with care and shared with context.
            </p>
          </div>
        </div>
      </section>

      <section className="home-support" aria-labelledby="home-support-title">
        <div className="page-width home-support__inner">
          <div className="home-support__copy">
            <p className="eyebrow">Our supporter</p>
            <h2 id="home-support-title">A partner in preserving what matters.</h2>
            <p>
              Madhaaf is made possible with support from TokenWorks. Together,
              we are building a place for language, family memory, and history
              to be preserved with care.
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
              <h2>Language lives in a voice worth hearing again.</h2>
              <p>
                Everyday speech holds more than definitions. Explore documented
                Kutchi expressions, their meanings, emerging grammar patterns,
                and the writing guide that preserves how they are spoken.
              </p>
              <div className="home-chapter__links">
                <Link className="text-link" href="/language">Explore language <span aria-hidden="true">↗</span></Link>
                <Link className="text-link" href="/dictionary">Browse the dictionary <span aria-hidden="true">↗</span></Link>
                <Link className="text-link" href="/language/grammar">Read the grammar notes <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
            <div className="home-chapter__art home-chapter__art--language" aria-hidden="true">
              <span className="home-language-mark home-language-mark--one" />
              <span className="home-language-mark home-language-mark--two" />
              <span className="home-language-mark home-language-mark--three" />
              <span className="home-language-mark home-language-mark--four" />
              <span className="home-art-label">Spoken / remembered / recorded</span>
            </div>
          </article>

          <article className="home-chapter home-chapter--family">
            <div className="home-chapter__copy">
              <h2>Family gives us a place in the story.</h2>
              <p>
                A family tree is more than a list of names. Follow the
                connections that have been reviewed for public sharing, and
                see how generations meet. Private family records stay protected.
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
              <span className="home-art-label">Lives linked across generations</span>
            </div>
          </article>

          <article className="home-chapter home-chapter--history">
            <div className="home-chapter__copy">
              <h2>History becomes a record we can return to.</h2>
              <p>
                The history archive brings together documented accounts,
                images, and oral traditions. Each published story has room
                for its sources, the people behind it, and the context it needs.
              </p>
              <Link className="text-link" href="/history">Read the histories <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="home-chapter__art home-chapter__art--history" aria-hidden="true">
              <span className="home-history-frame home-history-frame--back" />
              <span className="home-history-frame home-history-frame--front" />
              <span className="home-history-sun" />
              <span className="home-history-horizon" />
              <span className="home-art-label">A record still taking shape</span>
            </div>
          </article>
        </div>
      </section>

      <section className="home-closing" aria-labelledby="home-closing-title">
        <div className="page-width home-closing__grid">
          <span className="home-closing__mark" aria-hidden="true" />
          <div>
            <h2 id="home-closing-title">There is always more to remember.</h2>
            <p>
              Madhaaf is a growing archive. Its entries and histories are
              reviewed before publication, so the record can grow with care.
            </p>
            <Link className="button button--outline" href="/history">Spend time in the archive <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
