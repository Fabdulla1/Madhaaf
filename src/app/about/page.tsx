import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "About Madhaaf & Farhan Abdulla",
  description:
    "Why Farhan Abdulla founded Madhaaf: preserving his native East African Kutchi dialect, family history, and cultural identity through an evidence-led living archive.",
  alternates: { canonical: "/about" },
};

const themes = [
  {
    number: "01",
    title: "The language I speak",
    body:
      "I'm collecting the words, expressions and sentence patterns I know from everyday Kutchi. I want to document not just what a word means, but how people actually use it.",
    href: "/dictionary",
    link: "Explore the dictionary",
  },
  {
    number: "02",
    title: "The grammar I'm uncovering",
    body:
      "I've been comparing verb forms, questions, gender and number agreement, and words like ke that don't translate neatly into English. Every example helps me ask better questions.",
    href: "/language/articles",
    link: "Read my research notes",
  },
  {
    number: "03",
    title: "The history I want to preserve",
    body:
      "Our family histories, migrations and cultural memories deserve a place where I can preserve them carefully, alongside sources and the knowledge of the people who share them.",
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
            <p className="eyebrow">About Madhaaf / A note from its founder</p>
            <h1>I built Madhaaf because I don&apos;t want our stories to disappear.</h1>
            <p className="about-hero__intro">
              My name is Farhan Abdulla. Kutchi is my native tongue, and
              preserving the culture, history and identity I grew up knowing
              is the reason I started this project.
            </p>
            <p className="about-hero__signature">Farhan Abdulla <span>Founder of Madhaaf</span></p>
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
            <figcaption>Language, family and memory—threads I want to keep connected. Original editorial illustration.</figcaption>
          </figure>
        </header>
        <div className="about-opening">
          <p className="about-opening__eyebrow">Why I started</p>
          <div>
            <h2>For me, a language is part of knowing where I come from.</h2>
            <p>
              Madhaaf began with a personal concern: so much of what I know
              about my family and our culture lives in conversations,
              memories and words that are rarely written down. I don&apos;t want
              that knowledge to be lost simply because nobody took the time
              to record it.
            </p>
            <p>
              Kutchi is the language I speak and recognize as my own. It
              connects me to my family, to the people who came before us,
              and to the places our communities have called home. I&apos;m
              building Madhaaf as a place where I can document those
              connections and keep learning from them.
            </p>
          </div>
        </div>
        <section className="about-diaspora" aria-labelledby="about-roots-title">
          <div className="about-diaspora__heading">
            <p className="eyebrow">Our East African roots</p>
            <h2 id="about-roots-title">Our Kutchi has a history of movement.</h2>
          </div>
          <div className="about-diaspora__copy">
            <p>
              My family&apos;s roots are connected to Kutchi communities that
              migrated from the Kutch region to East Africa, including
              <strong> Kenya and Ethiopia</strong>. In our family histories,
              some of these journeys are relatively recent, while other
              accounts reach much further back—even more than a thousand
              years. I want to document those accounts, trace their sources
              where possible, and distinguish family tradition from what
              historical records can establish.
            </p>
            <p>
              The Kutchi I know isn&apos;t necessarily identical to the language
              spoken in Kutch today. Generations living in East Africa may
              have shaped our pronunciation, vocabulary and everyday
              expressions. I&apos;m especially interested in words we may have
              adopted through life in places such as Kenya and Ethiopia.
              Those possible influences are questions for research, not
              conclusions I want to assume in advance.
            </p>
            <p>
              I&apos;ve found very little detailed documentation of the particular
              East African Kutchi variety I speak. Rather than wait for
              someone else to write it down, I decided to begin collecting
              examples myself.
            </p>
          </div>
        </section>
        <section className="about-work" aria-labelledby="about-research-title">
          <div className="about-work__heading">
            <div>
              <p className="eyebrow">What I&apos;m documenting</p>
              <h2 id="about-research-title">Research that starts with the way we speak.</h2>
            </div>
            <p>
              I want Madhaaf to be more than a list of translations. The
              language deserves its own grammar, vocabulary record and
              collection of real examples.
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
            <p className="eyebrow">How I&apos;m working</p>
            <p>
              I start with the sentences I would naturally say, then compare
              small differences: a verb when the speaker is male or female,
              a noun in the singular and plural, or what happens when I
              remove a word like <em>ke</em>. I record which forms I know
              are natural and which explanations are still guesses. I&apos;m
              developing a Latin writing guide alongside that work, so
              the original spoken forms remain visible.
            </p>
            <Link className="text-link" href="/orthography">See my working writing guide ↗</Link>
          </div>
        </section>
        <section className="about-vision" aria-labelledby="about-future-title">
          <p className="eyebrow">Looking ahead</p>
          <h2 id="about-future-title">I want the next generation to have something to return to.</h2>
          <p>
            My hope is to build an archive that can grow with our knowledge:
            a dictionary, grammar studies, recorded speech, family histories,
            cultural research and, eventually, computational tools that make
            the language easier to study and use. The work is unfinished by
            design. I would rather preserve an honest question today than
            publish an answer I cannot support.
          </p>
        </section>
        <section className="about-support" aria-labelledby="about-support-title">
          <div>
            <p className="eyebrow">Acknowledgments</p>
            <h2 id="about-support-title">Made possible with TokenWorks.</h2>
            <p>
              None of this would be possible without <strong>TokenWorks LLC</strong>,
              the company I co-founded alongside <strong>Adam Anderson</strong>,
              my computational linguist co-founder. Through TokenWorks, I can
              continue developing Madhaaf, carrying out linguistic research
              and building the computational tools I hope will help preserve
              this language.
            </p>
            <p>
              I&apos;m grateful for that support and for the opportunity to bring
              the technical work together with something deeply personal to me.
            </p>
            <a className="text-link" href="https://www.tokenworks.ai/" rel="noopener noreferrer">
              Visit TokenWorks <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="about-support__brand">
            <Image src="/tokenworks-logo.png" alt="TokenWorks logo" width={150} height={150} />
            <strong>TokenWorks LLC</strong>
            <span>Supporting the preservation of East African Kutchi</span>
          </div>
        </section>
        <footer className="about-endnote">
          <p>
            This site is my ongoing research and preservation project, not a
            claim to speak for every Kutchi community. I want to keep
            documenting what I know, checking what I don&apos;t, and building
            a place where our language and history can remain part of our lives.
          </p>
          <Link className="button button--primary" href="/language/articles">
            Read my latest research <span aria-hidden="true">↗</span>
          </Link>
        </footer>
      </div>
    </PublicShell>
  );
}
