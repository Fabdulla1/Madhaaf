import type { Metadata } from "next";
import Link from "next/link";
import { LanguageNavigation } from "@/components/public/language-navigation";
import { PublicShell } from "@/components/public/shell";
import {
  copulaExamples,
  imperativeExamples,
  progressiveForms,
  questionExamples,
} from "@/lib/grammar";

export const metadata: Metadata = {
  title: "Kutchi grammar",
  description: "An evidence-led introduction to Mombasa Kutchi word order, verb forms, gender agreement, commands, questions, and the verb to be.",
};

function Example({ kutchi, english, note }: { kutchi: string; english: string; note?: string }) {
  return (
    <figure className="grammar-example">
      <blockquote lang="und">{kutchi}</blockquote>
      <figcaption>
        <span>{english}</span>
        {note && <small>{note}</small>}
      </figcaption>
    </figure>
  );
}

const contents = [
  { href: "#sentence-order", label: "Sentence order" },
  { href: "#action-verbs", label: "Action verbs & agreement" },
  { href: "#to-be", label: "The verb “to be”" },
  { href: "#commands", label: "Commands" },
  { href: "#questions", label: "Questions & respect" },
  { href: "#time", label: "Past & habitual" },
] as const;

export default function GrammarPage() {
  return (
    <PublicShell>
      <div className="page-width interior-page grammar-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/language">Language</Link><span aria-hidden="true">/</span>
          <span aria-current="page">Grammar</span>
        </nav>
        <LanguageNavigation active="grammar" />

        <header className="grammar-intro">
          <p className="eyebrow">Language / Grammar notes</p>
          <h1>How Mombasa Kutchi works.</h1>
          <p>
            A developing description of sentence patterns and verb forms,
            built from speaker-provided examples. These are observations,
            not a complete or formally standardized grammar.
          </p>
        </header>

        <div className="grammar-status">
          <strong>Reading the evidence</strong>
          <p>
            <b>Recorded</b> means a form was supplied in an example.
            <b> Likely pattern</b> marks an interpretation that needs more examples.
            <b> Unknown</b> means we do not have enough evidence yet.
          </p>
        </div>

        <div className="grammar-layout">
          <aside className="grammar-toc">
            <p className="eyebrow">On this page</p>
            <nav aria-label="Grammar topics">
              {contents.map((item, index) => (
                <a href={item.href} key={item.href}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  {item.label}
                </a>
              ))}
            </nav>
            <p>Forms are written as provided. Alternative spellings have not been normalized.</p>
          </aside>

          <div className="grammar-chapters">
            <section className="grammar-chapter" id="sentence-order" aria-labelledby="sentence-order-title">
              <p className="grammar-chapter__number">01 / Sentence structure</p>
              <h2 id="sentence-order-title">The verb often comes last.</h2>
              <p>
                The recorded examples commonly place the subject first,
                followed by an object or description, with the verb at the end.
                This supports a <strong>subject–object–verb (SOV)</strong> tendency,
                but other clause types still need testing.
              </p>
              <div className="grammar-breakdown" aria-label="Sentence parts">
                <div><strong lang="und">Thu(n)</strong><span>You · subject</span></div>
                <div><strong lang="und">khadho</strong><span>Food · object</span></div>
                <div><strong lang="und">kyentho</strong><span>Are eating · verb</span></div>
              </div>
              <p className="grammar-translation">“You are eating food” (addressing a man).</p>
              <Example kutchi="Paani sare’lo ai" english="The water is rotten" note="Noun + description + a form translated as “is”" />
              <p className="grammar-caution">Likely pattern: verb-final order. We cannot yet claim that every Kutchi sentence follows this order.</p>
            </section>

            <section className="grammar-chapter" id="action-verbs" aria-labelledby="action-verbs-title">
              <p className="grammar-chapter__number">02 / Action verbs</p>
              <h2 id="action-verbs-title">The verb changes with who is acting.</h2>
              <p>
                Forms of <i lang="und">kar</i> (“do”) and the verb meaning
                “eat” vary with the subject. The forms below are used in
                sentences translated as “am / is / are doing” or “eating.”
                Whether they also express a habitual present is still unknown.
              </p>
              <div className="grammar-table-wrap" role="region" aria-label="Recorded verb forms" tabIndex={0}>
                <table className="grammar-table">
                  <caption>Recorded forms: “to do” and “to eat” in ongoing-action examples</caption>
                  <thead>
                    <tr><th scope="col">Subject</th><th scope="col">Pronoun</th><th scope="col">Do</th><th scope="col">Eat</th></tr>
                  </thead>
                  <tbody>
                    {progressiveForms.map((form) => (
                      <tr key={form.subject}>
                        <th scope="row">{form.subject}</th>
                        <td lang="und">{form.pronoun}</td>
                        <td lang="und">{form.doForm ?? "Not recorded"}</td>
                        <td lang="und">{form.eatForm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="grammar-caption">
                The feminine eating form <i lang="und">kyanthi</i> was reported as a counterpart to
                <i lang="und"> kyantho</i>, without a full example sentence.
                The spelling of “we” also varies in the examples: <i lang="und">pa(n)</i> and <i lang="und">paa(n)</i>.
              </p>
              <div className="grammar-observation">
                <h3>What the endings suggest</h3>
                <p>
                  For the recorded singular action forms, <strong>-tho</strong> appears with
                  masculine subjects and <strong>-thi</strong> with feminine subjects.
                  The collective and plural examples use forms ending in <strong>-thaa</strong>.
                </p>
                <p>
                  The material before those endings also changes:
                  <i lang="und"> karantho</i>, <i lang="und">karentho</i> and
                  <i lang="und"> karetho</i>. This may encode person, but the
                  boundaries between stems and grammatical suffixes are not yet established.
                </p>
              </div>
              <Example kutchi="Au(n) khadho kyantho" english="I am eating food" note="First-person example" />
              <Example kutchi="Hee khadho kyethi" english="She is eating food" note="Feminine third-person example" />
              <Example kutchi="Hinee khadho kyenthaa" english="They are eating food" note="Plural example" />
            </section>

            <section className="grammar-chapter" id="to-be" aria-labelledby="to-be-title">
              <p className="grammar-chapter__number">03 / State & description</p>
              <h2 id="to-be-title">Different ways to say “to be.”</h2>
              <p>
                Several forms serve meanings translated as “am,” “is,” or “are.”
                They may belong to a shared conjugation system, but this
                relationship has not yet been demonstrated.
              </p>
              <div className="grammar-example-list">
                {copulaExamples.map((example) => (
                  <Example key={example.kutchi} {...example} note={example.observation} />
                ))}
              </div>
              <p className="grammar-caution">
                Unknown: whether <i lang="und">i(n)ya</i>, <i lang="und">i(n)ye</i>,
                <i lang="und"> ai</i> and <i lang="und">i(n)yo</i> are inflections
                of a single verb. The endings of <i lang="und">sare’lo</i> also
                need testing with different genders and numbers.
              </p>
            </section>

            <section className="grammar-chapter" id="commands" aria-labelledby="commands-title">
              <p className="grammar-chapter__number">04 / Imperatives</p>
              <h2 id="commands-title">Short forms for direct commands.</h2>
              <p>
                The recorded commands use <i lang="und">kar</i> (“do”) or
                <i lang="und"> khaa</i> (“eat”), without the longer endings
                seen in the ongoing-action examples. Adverbs or location
                words can precede <i lang="und">kar</i>.
              </p>
              <div className="grammar-example-list">
                {imperativeExamples.map((example) => <Example key={example.kutchi} {...example} />)}
              </div>
              <p className="grammar-caution">Unknown: polite or plural imperative forms, and whether other verbs share the same command formation.</p>
            </section>

            <section className="grammar-chapter" id="questions" aria-labelledby="questions-title">
              <p className="grammar-chapter__number">05 / Questions & address</p>
              <h2 id="questions-title">Question words come before the verb in these examples.</h2>
              <p>
                The question word <i lang="und">kuroo</i> corresponds to “what,”
                while <i lang="und">kee(n)</i> occurs in “how are you?”
                These questions retain a verb-final pattern. Some plural
                forms may also be used for respectful address.
              </p>
              <div className="grammar-example-list">
                {questionExamples.map((example) => <Example key={example.kutchi} {...example} />)}
              </div>
              <p className="grammar-caution">
                Speaker note: <i lang="und">Kuroo karenthaa?</i> can mean
                “What are they doing?” and its interpretation may depend on
                a plural or formal context. The exact distribution of honorific
                verb forms remains open.
              </p>
            </section>

            <section className="grammar-chapter" id="time" aria-labelledby="time-title">
              <p className="grammar-chapter__number">06 / Tense & aspect</p>
              <h2 id="time-title">We have a past example. The habitual is still open.</h2>
              <Example
                kutchi="Au(n) khadho kadhyose"
                english="I ate food yesterday"
                note="Past-time interpretation supplied by the speaker"
              />
              <p>
                <i lang="und">Kadhyose</i> is recorded in a past-time sentence,
                but we cannot yet identify its component endings or distinguish
                simple past from perfective meaning. The English translation
                includes “yesterday” without a separately identified time word
                in the Kutchi example.
              </p>
              <p>
                We do not yet have an attested translation of “I eat food every day.”
                That comparison is needed before claiming a separate habitual
                construction.
              </p>
            </section>

            <section className="grammar-next" aria-labelledby="grammar-next-title">
              <p className="eyebrow">Continue exploring</p>
              <h2 id="grammar-next-title">Words and patterns belong together.</h2>
              <p>Use the dictionary for published meanings, or consult the writing guide to understand the draft spellings preserved in these examples.</p>
              <div className="language-hero__actions">
                <Link className="button button--primary" href="/dictionary">Browse the dictionary <span aria-hidden="true">↗</span></Link>
                <Link className="text-link" href="/orthography">Read the writing guide <span aria-hidden="true">↗</span></Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
