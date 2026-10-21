import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "Kutchi grammar",
  description: "A developing, evidence-led grammar of East African Mombasa Kutchi with documented example sentences.",
};

const eating = [
  ["I", "au(n)", "kyantho", "Au(n) khadho kyantho"],
  ["You · masculine", "thu(n)", "kyentho", "Thu(n) khadho kyentho"],
  ["You · feminine", "thu(n)", "kyenthi", "Thu(n) khadho kyenthi"],
  ["He", "hee", "kyetho", "Hee khadho kyetho"],
  ["She", "hee", "kyethi", "Hee khadho kyethi"],
  ["We", "paa(n)", "kyonthaa", "Paa(n) khadho kyonthaa"],
  ["They", "hinee", "kyenthaa", "Hinee khadho kyenthaa"],
  ["Everyone", "mere", "kyenthaa", "Mere kuroo kyenthaa?"],
] as const;

const doing = [
  ["I", "karantho", "Au(n) hee karantho"],
  ["You · masculine", "karentho", "Kuroo karentho?"],
  ["You · feminine", "karenthi", "Kuroo karenthi?"],
  ["He", "karetho", "Hee hoo karetho"],
  ["She", "karethi", "Hee hoo karethi"],
  ["We", "karonthaa", "Pa(n) masthi karonthaa"],
  ["Everyone", "karenthaa", "Mere sanas karenthaa"],
] as const;

function Evidence({ children }: { children: React.ReactNode }) {
  return <span className="grammar-evidence">{children}</span>;
}

export default function GrammarPage() {
  return (
    <PublicShell>
      <div className="page-width interior-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/language">Language</Link><span aria-hidden="true">/</span>
          <span aria-current="page">Grammar</span>
        </nav>
        <header className="page-intro grammar-intro">
          <p className="eyebrow">Language / Grammar notebook</p>
          <h1>How Kutchi sentences work.</h1>
          <p>
            A developing description of East African Kutchi spoken in Mombasa.
            Every example below comes from speaker-supplied sentences; the
            explanations distinguish what was heard from what remains to be tested.
          </p>
        </header>
        <div className="grammar-status" role="note">
          <strong>Working grammar · Edition 0.1</strong>
          <span>Attested examples are not a complete or standardized grammar. Spellings are preserved as supplied.</span>
        </div>
        <div className="grammar-layout">
          <nav className="grammar-toc" aria-label="On this page">
            <p className="eyebrow">Contents</p>
            <a href="#word-order">01 · Word order</a>
            <a href="#pronouns">02 · Pronouns</a>
            <a href="#verbs">03 · Verb agreement</a>
            <a href="#commands">04 · Commands</a>
            <a href="#questions">05 · Questions</a>
            <a href="#being">06 · Being &amp; descriptions</a>
            <a href="#open-questions">07 · Still investigating</a>
          </nav>
          <div className="grammar-articles">
            <section id="word-order" className="grammar-section">
              <p className="eyebrow">01 / Sentence structure</p>
              <h2>Verbs tend to come last.</h2>
              <Evidence>Observed in these examples</Evidence>
              <p>
                Examples with an explicit subject and object show a subject–object–verb
                order. This does not yet establish the order of every sentence type.
              </p>
              <div className="grammar-example">
                <p className="grammar-example__kutchi">Au(n) khadho kyantho</p>
                <p>I am eating food.</p>
                <div className="grammar-breakdown" aria-label="Word-by-word analysis">
                  <span><strong>Au(n)</strong><small>subject · I</small></span>
                  <span><strong>khadho</strong><small>object · food</small></span>
                  <span><strong>kyantho</strong><small>verb · am eating</small></span>
                </div>
              </div>
            </section>
            <section id="pronouns" className="grammar-section">
              <p className="eyebrow">02 / Reference</p>
              <h2>Pronouns and subjects.</h2>
              <Evidence>Speaker-attested forms</Evidence>
              <div className="grammar-table-wrap">
                <table className="grammar-table">
                  <thead><tr><th scope="col">Kutchi</th><th scope="col">English</th><th scope="col">Notes</th></tr></thead>
                  <tbody>
                    <tr><td>au(n)</td><td>I</td><td>first-person singular</td></tr>
                    <tr><td>thu(n)</td><td>you</td><td>singular</td></tr>
                    <tr><td>hee</td><td>he / she</td><td>same recorded pronoun with different verb forms</td></tr>
                    <tr><td>paa(n)</td><td>we</td><td>first-person plural</td></tr>
                    <tr><td>hinee</td><td>they</td><td>third-person plural</td></tr>
                    <tr><td>mere</td><td>everyone</td><td>collective meaning; not “we”</td></tr>
                    <tr><td>ai(n)</td><td>you</td><td>formal or plural, from a greeting</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="grammar-fineprint">
                The pronoun <em>hee</em> is used for both “he” and “she” in the supplied
                eating sentences. The possibility that it also means “this” needs
                further testing.
              </p>
            </section>
            <section id="verbs" className="grammar-section">
              <p className="eyebrow">03 / Verbs</p>
              <h2>Action verbs agree with their subjects.</h2>
              <Evidence>Attested forms; interpretation provisional</Evidence>
              <p>
                The ongoing-action forms of “to eat” and “to do” differ by person,
                gender and number. In the recorded singular forms, masculine
                often ends in <strong>-tho</strong> and feminine in <strong>-thi</strong>;
                the recorded plural forms end in <strong>-thaa</strong>.
              </p>
              <h3>Eating</h3>
              <div className="grammar-table-wrap">
                <table className="grammar-table">
                  <thead><tr><th scope="col">Subject</th><th scope="col">Pronoun</th><th scope="col">Form</th><th scope="col">Example</th></tr></thead>
                  <tbody>{eating.map(([subject, pronoun, form, example]) => (
                    <tr key={subject}><th scope="row">{subject}</th><td>{pronoun}</td><td><strong>{form}</strong></td><td>{example}</td></tr>
                  ))}</tbody>
                </table>
              </div>
              <p className="grammar-fineprint">
                The final row is a question: “Mere kuroo kyenthaa?” — “What is everyone eating?”
                The other example sentences use <em>khadho</em> (“food”).
              </p>
              <h3>Doing</h3>
              <div className="grammar-table-wrap">
                <table className="grammar-table">
                  <thead><tr><th scope="col">Subject</th><th scope="col">Form</th><th scope="col">Recorded sentence</th></tr></thead>
                  <tbody>{doing.map(([subject, form, example]) => (
                    <tr key={subject}><th scope="row">{subject}</th><td><strong>{form}</strong></td><td>{example}</td></tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="grammar-note">
                <strong>Emerging pattern — not a fixed rule yet</strong>
                <p>
                  Compare <em>karantho / kyantho</em>, <em>karentho / kyentho</em>,
                  <em> karethi / kyethi</em>, and <em>karonthaa / kyonthaa</em>.
                  The correspondence is consistent, but we have not proven
                  where stems end or individual grammatical suffixes begin.
                </p>
              </div>
            </section>
            <section id="commands" className="grammar-section">
              <p className="eyebrow">04 / Imperatives</p>
              <h2>Short forms give commands.</h2>
              <Evidence>Attested</Evidence>
              <div className="grammar-pairs">
                <div><strong>Jaldi kar!</strong><span>Do it quickly!</span></div>
                <div><strong>Hadaa kar!</strong><span>Do it here!</span></div>
                <div><strong>Hoodaa kar!</strong><span>Do it there!</span></div>
                <div><strong>Sanas kar!</strong><span>Defecate!</span></div>
                <div><strong>Khaa!</strong><span>Eat!</span></div>
              </div>
              <p>
                <em>Kar</em> and <em>khaa</em> are attested as commands.
                Polite and plural imperatives remain undocumented.
              </p>
            </section>
            <section id="questions" className="grammar-section">
              <p className="eyebrow">05 / Questions</p>
              <h2>Question words appear before the verb.</h2>
              <Evidence>Observed in these examples</Evidence>
              <div className="grammar-pairs">
                <div><strong>Kuroo karentho?</strong><span>What are you doing? · masculine</span></div>
                <div><strong>Kuroo karenthi?</strong><span>What are you doing? · feminine</span></div>
                <div><strong>Mere kuroo kyenthaa?</strong><span>What is everyone eating?</span></div>
                <div><strong>Ai(n) kee(n) i(n)yo?</strong><span>How are you? · formal or plural</span></div>
              </div>
              <p>
                These questions retain the verb at the end. The exact function
                and placement of question words require additional examples.
              </p>
            </section>
            <section id="being" className="grammar-section">
              <p className="eyebrow">06 / Descriptions and states</p>
              <h2>Several forms express “to be.”</h2>
              <Evidence>Forms attested; shared paradigm unconfirmed</Evidence>
              <div className="grammar-pairs">
                <div><strong>Au(n) hadaa i(n)ya</strong><span>I am here.</span></div>
                <div><strong>Mere hadaa i(n)ye</strong><span>Everyone is here.</span></div>
                <div><strong>Paani sare’lo ai</strong><span>The water is rotten.</span></div>
                <div><strong>Mujo maru sare’lo ai</strong><span>My man is rotten.</span></div>
              </div>
              <p>
                The forms <em>i(n)ya</em>, <em>i(n)ye</em>, <em>i(n)yo</em> and
                <em> ai</em> may belong to a connected conjugation system.
                We cannot yet say whether <em>sare’lo</em> is an adjective or a
                participle, or which agreement patterns apply to it.
              </p>
            </section>
            <section id="open-questions" className="grammar-section">
              <p className="eyebrow">07 / Field notes</p>
              <h2>What we still need to learn.</h2>
              <ul className="grammar-questions">
                <li>Does the same verb form describe “I eat every day” and “I am eating now”?</li>
                <li>How do past forms such as <em>kadhyose</em> change across subjects?</li>
                <li>How are polite and plural commands formed?</li>
                <li>How do adjectives and participles agree with nouns?</li>
                <li>Do formal and plural second-person forms always coincide?</li>
                <li>Does <em>(n)</em> indicate vowel nasalization or a consonant in each word?</li>
              </ul>
              <p>
                Another recorded form is <em>Au(n) khadho kadhyose</em>,
                translated as “I ate food yesterday.” It supplies evidence
                of a past-time construction but not enough to establish a past-tense paradigm.
              </p>
              <Link className="text-link" href="/orthography">
                Explore the draft writing guide <span aria-hidden="true">↗</span>
              </Link>
            </section>
          </div>
        </div>
        <div className="grammar-return">
          <Link className="text-link" href="/language">← Back to Language</Link>
          <Link className="text-link" href="/dictionary">Open the dictionary ↗</Link>
        </div>
      </div>
    </PublicShell>
  );
}
