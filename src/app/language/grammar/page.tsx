import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public/shell";
import {
  AdjectivesSection,
  CaseSection,
  ComplexSection,
  DemonstrativesSection,
  DesireSection,
  NounsSection,
  PossessionSection,
} from "@/components/public/grammar-expansion";

export const metadata: Metadata = {
  title: "Kutchi grammar",
  description: "A developing, evidence-led grammar of East African Mombasa Kutchi with documented example sentences.",
};

const eating = [
  ["I", "au(n)", "kya(n)tho", "Au(n) khadho kya(n)tho"],
  ["You · masculine", "thu(n)", "kye(n)tho", "Thu(n) khadho kye(n)tho"],
  ["You · feminine", "thu(n)", "kye(n)thi", "Thu(n) khadho kye(n)thi"],
  ["He", "hee", "kyetho", "Hee khadho kyetho"],
  ["She", "hee", "kyethi", "Hee khadho kyethi"],
  ["We", "paa(n)", "kyo(n)thaa", "Paa(n) khadho kyo(n)thaa"],
  ["They", "hinee", "kye(n)thaa", "Hinee khadho kye(n)thaa"],
  ["Everyone", "mere", "kye(n)thaa", "Mere kuroo kye(n)thaa?"],
] as const;

const doing = [
  ["I", "kara(n)tho", "Au(n) hee kara(n)tho"],
  ["You · masculine", "kare(n)tho", "Kuroo kare(n)tho?"],
  ["You · feminine", "kare(n)thi", "Kuroo kare(n)thi?"],
  ["He", "karetho", "Hee hoo karetho"],
  ["She", "karethi", "Hee hoo karethi"],
  ["We", "karo(n)thaa", "Pa(n) masthi karo(n)thaa"],
  ["Everyone", "kare(n)thaa", "Mere sanas kare(n)thaa"],
] as const;


const verbSurvey = [
  { headword: "dhor", gloss: "run", first: "dhora(n)tho", second: "dore(n)tho", third: "doretho", we: "doro(n)thaa", they: "dore(n)thaa", command: "dhor", past: "dhoryose", future: "dhordhose" },
  { headword: "kan", gloss: "take", first: "kana(n)tho", second: "kane(n)tho", third: "kanetho", we: "kano(n)thaa", they: "kane(n)thaa", command: "kan", past: "kayose", future: "kandhose" },
  { headword: "fagai", gloss: "throw", first: "fagaya(n)tho", second: "fagaye(n)tho", third: "fagayetho", we: "fagayo(n)thaa", they: "fagaye(n)thaa", command: "fagai", past: "fagayose", future: "fagayndhose" },
  { headword: "nikro", gloss: "leave / depart", first: "nikra(n)tho", second: "nikre(n)tho", third: "nikretho", we: "nikro(n)thaa", they: "nikre(n)thaa", command: "nikar", past: "nikryose", future: "nikardhose" },
  { headword: "vin", gloss: "go", first: "vina(n)tho", second: "vine(n)tho", third: "vinetho", we: "vino(n)thaa", they: "vine(n)thaa", command: "vin", past: "oosyose", future: "vendhose" },
  { headword: "kar", gloss: "do", first: "kara(n)tho", second: "kare(n)tho", third: "karetho", we: "karo(n)thaa", they: "kare(n)thaa", command: "kar", past: "kyose", future: "kardhose" },
  { headword: "chad", gloss: "let go / leave it", first: "chada(n)tho", second: "chade(n)tho", third: "chadetho", we: "chado(n)thaa", they: "chade(n)thaa", command: "chad", past: "chadidinose / chadyavose", future: "chadadhose" },
  { headword: "sum", gloss: "sleep", first: "suma(n)tho", second: "sume(n)tho", third: "sumetho", we: "sumo(n)thaa", they: "sume(n)thaa", command: "sum", past: "suthose", future: "sumdhose" },
] as const;

function Evidence({ children }: { children: React.ReactNode }) {
  return <span className="grammar-evidence">{children}</span>;
}

const contents = [
  ["word-order", "Word order"],
  ["pronouns", "Pronouns"],
  ["demonstratives", "Demonstratives"],
  ["nouns", "Noun forms"],
  ["adjectives", "Adjectives"],
  ["verbs", "Verb agreement"],
  ["verb-survey", "Eight-verb survey"],
  ["tense-aspect", "Tense and aspect"],
  ["negation", "Negation"],
  ["commands", "Commands"],
  ["case-marking", "Case marking · ke"],
  ["desire", "Desire"],
  ["possession", "Possession"],
  ["questions", "Questions"],
  ["complex-sentences", "Complex sentences"],
  ["being", "Being and descriptions"],
  ["open-questions", "Still investigating"],
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
          <strong>Working grammar · Edition 0.3</strong>
          <span>Recorded examples and explicit speaker judgments are presented as evidence. Proposed analyses are labeled as hypotheses, and unresolved contrasts stay visible. The working notation writes n immediately before th as (n); supplied sentence spellings are retained.</span>
        </div>
        <div className="grammar-layout">
          <nav className="grammar-toc" aria-label="On this page">
            <p className="eyebrow">Contents</p>
            {contents.map(([anchor, label], index) => (
              <a href={`#${anchor}`} key={anchor}><span aria-hidden="true">{String(index + 1).padStart(2, "0")} · </span>{label}</a>
            ))}
          </nav>
          <details id="grammar-chapters" className="grammar-mobile-toc">
            <summary>Browse {contents.length} grammar chapters</summary>
            <nav aria-label="Grammar chapters">
              {contents.map(([anchor, label], index) => (
                <a href={`#${anchor}`} key={anchor}><span aria-hidden="true">{String(index + 1).padStart(2, "0")} · </span>{label}</a>
              ))}
            </nav>
          </details>
          <a className="grammar-back-to-chapters" href="#grammar-chapters">↑ Chapters</a>
          <div className="grammar-articles">
            <section id="word-order" className="grammar-section">
              <p className="eyebrow">Sentence structure</p>
              <h2>Verbs tend to come last.</h2>
              <Evidence>Observed in these examples</Evidence>
              <p>
                Examples with an explicit subject and object show a subject–object–verb
                order. This does not yet establish the order of every sentence type.
              </p>
              <div className="grammar-example">
                <p className="grammar-example__kutchi">Au(n) khadho kya(n)tho</p>
                <p>I am eating food.</p>
                <div className="grammar-breakdown" aria-label="Word-by-word analysis">
                  <span><strong>Au(n)</strong><small>subject · I</small></span>
                  <span><strong>khadho</strong><small>object · food</small></span>
                  <span><strong>kya(n)tho</strong><small>verb · am eating</small></span>
                </div>
              </div>
            </section>
            <section id="pronouns" className="grammar-section">
              <p className="eyebrow">Reference</p>
              <h2>Pronouns and subjects.</h2>
              <Evidence>Speaker-attested forms</Evidence>
              <p className="grammar-table-cue">Scroll horizontally to see all table columns.</p>
              <div className="grammar-table-wrap" role="region" aria-label="Recorded pronouns" tabIndex={0}>
                <table className="grammar-table">
                  <caption>Pronouns in supplied sentences</caption>
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
                <em>Hee</em> was recorded with “he” and “she” readings in the earlier
                eating sentences. New sentences also attest <em>hee</em> as “this”
                before a noun. Whether these uses are one grammatical form or
                separate lexical items remains unresolved. The dictionary currently
                glosses <em>mere</em> as “all”; its “everyone” use here is contextual.
              </p>
            </section>
            <DemonstrativesSection />
            <NounsSection />
            <AdjectivesSection />
            <section id="verbs" className="grammar-section">
              <p className="eyebrow">Verbs</p>
              <h2>Action verbs agree with their subjects.</h2>
              <Evidence>Attested forms; interpretation provisional</Evidence>
              <p>
                The present forms of “to eat” and “to do” differ by person,
                gender and number. In the recorded singular forms, masculine
                often ends in <strong>-(n)tho</strong> and feminine in <strong>-(n)thi</strong>;
                the recorded plural forms end in <strong>-(n)thaa</strong> in several paradigms. The (n) notation is used immediately before th where an n was previously written; its exact phonetic realization remains to be verified.
              </p>
              <h3>Eating</h3>
              <p className="grammar-table-cue">Scroll horizontally to see all table columns.</p>
              <div className="grammar-table-wrap" role="region" aria-label="Eating forms" tabIndex={0}>
                <table className="grammar-table">
                  <caption>Recorded eating forms by subject</caption>
                  <thead><tr><th scope="col">Subject</th><th scope="col">Pronoun</th><th scope="col">Form</th><th scope="col">Example</th></tr></thead>
                  <tbody>{eating.map(([subject, pronoun, form, example]) => (
                    <tr key={subject}><th scope="row">{subject}</th><td>{pronoun}</td><td><strong>{form}</strong></td><td>{example}</td></tr>
                  ))}</tbody>
                </table>
              </div>
              <p className="grammar-fineprint">
                The final row is a question: “Mere kuroo kye(n)thaa?” — “What is everyone eating?”
                The other example sentences use <em>khadho</em> (“food”).
              </p>
              <h3>Doing</h3>
              <p className="grammar-table-cue">Scroll horizontally to see all table columns.</p>
              <div className="grammar-table-wrap" role="region" aria-label="Doing forms" tabIndex={0}>
                <table className="grammar-table">
                  <caption>Recorded doing forms by subject</caption>
                  <thead><tr><th scope="col">Subject</th><th scope="col">Form</th><th scope="col">Recorded sentence</th></tr></thead>
                  <tbody>{doing.map(([subject, form, example]) => (
                    <tr key={subject}><th scope="row">{subject}</th><td><strong>{form}</strong></td><td>{example}</td></tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="grammar-note">
                <strong>Emerging pattern — not a fixed rule yet</strong>
                <p>
                  Compare <em>kara(n)tho / kya(n)tho</em>, <em>kare(n)tho / kye(n)tho</em>,
                  <em> karethi / kyethi</em>, and <em>karo(n)thaa / kyo(n)thaa</em>.
                  The correspondence is consistent, but we have not proven
                  where stems end or individual grammatical suffixes begin.
                </p>
              </div>
            </section>
            <section id="verb-survey" className="grammar-section">
              <p className="eyebrow">Eight-verb survey</p>
              <h2>A pattern across eight verbs.</h2>
              <Evidence>Speaker-elicited paradigm; spelling convention updated</Evidence>
              <p>
                These present forms were elicited with the subjects “I” (masculine),
                “you” (masculine), “he”, “we” and “they”. The full feminine
                singular forms were also elicited for all eight verbs.
                The spelling <strong>(n)</strong> is used wherever the previously
                written n occurs immediately before th. This is a notation
                convention, not a claim that n is always optional.
              </p>
              <p className="grammar-table-cue">Scroll horizontally to see all table columns.</p>
              <div className="grammar-table-wrap" role="region" aria-label="Eight verb present forms" tabIndex={0}>
                <table className="grammar-table">
                  <caption>Eight attested verb paradigms in selected present contexts</caption>
                  <thead><tr><th scope="col">Verb</th><th scope="col">I · M</th><th scope="col">You · M</th><th scope="col">He</th><th scope="col">We</th><th scope="col">They</th></tr></thead>
                  <tbody>{verbSurvey.map((v) => (
                    <tr key={v.headword}>
                      <th scope="row">{v.headword}<br/><small>{v.gloss}</small></th>
                      <td>{v.first}</td><td>{v.second}</td><td>{v.third}</td><td>{v.we}</td><td>{v.they}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <p>
                Corresponding feminine singular forms include <em>kana(n)thi</em>,
                <em> kane(n)thi</em>, <em>kanethi</em>, and similarly shaped forms
                of the other verbs. The repeated patterns support person, gender,
                and number agreement, but not a final division into morphemes.
              </p>
              <div className="grammar-note">
                <strong>Pronunciation and transcription to revisit</strong>
                <p>
                  The “run” data contained <em>dhora(n)tho</em> for the masculine
                  first person but <em>dora(n)thi</em> and <em>dore(n)tho</em> elsewhere.
                  Here the first-person written form is represented
                  <em> dhora(n)tho</em> following the supplied dictionary headword.
                  Whether dh and d reflect different pronunciations is unresolved.
                </p>
              </div>
            </section>
            <section id="tense-aspect" className="grammar-section">
              <p className="eyebrow">Tense and aspect</p>
              <h2>The present, past and future.</h2>
              <Evidence>Attested examples; morphological analysis provisional</Evidence>
              <h3>The same present form can describe habits</h3>
              <div className="grammar-pairs">
                <div><strong>Au(n) suma(n)tho</strong><span>I am sleeping.</span></div>
                <div><strong>Au(n) haroj suma(n)tho</strong><span>I sleep every day.</span></div>
                <div><strong>Au(n) vina(n)tho</strong><span>I am going.</span></div>
                <div><strong>Au(n) haroj vina(n)tho</strong><span>I go every day.</span></div>
              </div>
              <p>
                <em>Haroj</em> means “every day” in these examples. Present
                forms recur in both ongoing and habitual readings. We therefore
                cannot call <em>-(n)tho</em> a dedicated progressive ending.
              </p>
              <h3>First-person future forms</h3>
              <p>
                The eight elicited future forms share the written sequence
                <strong> -dhose</strong>. The full sequence may also encode
                agreement; only first-person future contexts have been elicited.
              </p>
              <p className="grammar-table-cue">Scroll horizontally to see all table columns.</p>
              <div className="grammar-table-wrap" role="region" aria-label="Future past and command forms" tabIndex={0}>
                <table className="grammar-table">
                  <caption>Recorded future, past-time and command forms</caption>
                  <thead><tr><th scope="col">Verb</th><th scope="col">Future</th><th scope="col">Past-time form (I)</th><th scope="col">Imperative</th></tr></thead>
                  <tbody>{verbSurvey.map((v) => (
                    <tr key={v.headword}>
                      <th scope="row">{v.headword}</th>
                      <td>{v.future}</td><td>{v.past}</td><td>{v.command}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <p>
                <em>Savare</em> (“tomorrow”) appears before or after the
                subject in the supplied future sentences, including
                <em> Savare au(n) kandhose</em> and
                <em> au(n) savare kandhose</em>. The subject can also be omitted:
                <em> savare fagayndhose</em>.
              </p>
              <h3>Past-tense stem changes and agreement</h3>
              <div className="grammar-pairs">
                <div><strong>Au(n) kaal oosyose</strong><span>I went yesterday · masculine</span></div>
                <div><strong>Au(n) kaal ooseise</strong><span>I went yesterday · feminine</span></div>
                <div><strong>Paa(n) kaal oosyasee</strong><span>We went yesterday</span></div>
                <div><strong>Mere kaal oosyaa</strong><span>Everyone went yesterday</span></div>
                <div><strong>Au(n) kaal suthose</strong><span>I slept yesterday · masculine</span></div>
                <div><strong>Au(n) kaal suthese</strong><span>I slept yesterday · feminine</span></div>
                <div><strong>Hinee kaal suthyaa</strong><span>They slept yesterday</span></div>
                <div><strong>Mere kaal suthyaa</strong><span>Everyone slept yesterday</span></div>
              </div>
              <p>
                <em>Kaal</em> means “yesterday” in these examples.
                The past forms of <em>vin</em> (“go”) and <em>sum</em>
                (“sleep”) differ substantially from their present stems and show
                gender or number distinctions. We cannot yet identify a regular
                past-tense suffix for all verbs.
              </p>
              <p>
                The verb <em>chad</em> has two separately supplied past forms,
                <em> chadidinose</em> (“I let go of it yesterday”) and
                <em> chadyavose</em> (“I left it yesterday”).
                Their difference in meaning or construction is still under investigation.
              </p>
            </section>
            <section id="negation" className="grammar-section">
              <p className="eyebrow">Negation</p>
              <h2>Not doing, and not going to do.</h2>
              <Evidence>Observed negatives; agreement and syntax unsettled</Evidence>
              <div className="grammar-pairs">
                <div><strong>Au(n) natho kara(n)</strong><span>I am not doing it.</span></div>
                <div><strong>Natho sumaa(n)</strong><span>I am not sleeping.</span></div>
                <div><strong>Au(n) natho chada(n)</strong><span>I am not letting go.</span></div>
                <div><strong>Nah kardhose</strong><span>I will not do it.</span></div>
                <div><strong>Nah vendhose</strong><span>I will not go.</span></div>
                <div><strong>Natho vina(n)tho</strong><span>I am not going. · alternative form</span></div>
              </div>
              <p>
                <em>Natho</em> recurs in present negative expressions, while
                <em> nah</em> occurs with future forms. It is not yet clear
                whether either is an independent negative particle or an
                inflected auxiliary. Both <em>natho vina</em> and
                <em> natho vina(n)tho</em> were recorded; neither is discarded.
                Some speaker examples also place the negative element
                after the lexical verb, so a rigid word-order rule is premature.
              </p>
              <h3>More recorded negative environments</h3>
              <div className="grammar-pairs">
                <div><strong>Natho sume</strong><span>He is not sleeping.</span></div>
                <div><strong>Nathi sume</strong><span>She is not sleeping.</span></div>
                <div><strong>Mukhe hinee cheejeu(n) nathaa kape(n)</strong><span>I don&apos;t want these things.</span></div>
                <div><strong>Paa(n) kaal na oosyasee</strong><span>We did not go yesterday.</span></div>
                <div><strong>Nah sum!</strong><span>Don&apos;t sleep!</span></div>
                <div><strong>Nah vin!</strong><span>Don&apos;t go!</span></div>
                <div><strong>Nah kar!</strong><span>Don&apos;t do it!</span></div>
                <div><strong>Mukhe kheno ai, pun khadho nai</strong><span>I want to eat, but there is no food.</span></div>
              </div>
              <div className="grammar-note">
                <strong>Hypothesis · possible negative auxiliary agreement</strong>
                <p><em>Natho</em>, <em>nathi</em> and <em>nathaa</em> occur in different gender or number contexts, but their full distribution is not known. <em>Na</em> occurs in the recorded past negative, <em>nah</em> in negative commands and previously recorded future negatives, and <em>nai</em> in a negative existential expression. These are distinct observed contexts, not interchangeable negative forms. The dictionary&apos;s current gloss for <em>nah</em> does not yet encode every contextual use shown here.</p>
              </div>
            </section>
            <section id="commands" className="grammar-section">
              <p className="eyebrow">Imperatives</p>
              <h2>Short forms give commands.</h2>
              <Evidence>Attested</Evidence>
              <div className="grammar-pairs">
                <div><strong>Jaldi kar!</strong><span>Do it quickly!</span></div>
                <div><strong>Hadaa kar!</strong><span>Do it here!</span></div>
                <div><strong>Hoodaa kar!</strong><span>Do it there!</span></div>
                <div><strong>Sanas kar!</strong><span>Defecate!</span></div>
                <div><strong>Khaa!</strong><span>Eat!</span></div>
                {verbSurvey.map((v) => (
                  <div key={v.headword}><strong>{v.command}!</strong><span>{v.gloss} · singular command</span></div>
                ))}
              </div>
              <p>
                <em>Kar</em> and <em>khaa</em> are attested as commands.
                Seven of the eight newly elicited singular commands match their supplied headwords; <em>nikar</em> differs from <em>nikro</em>. Polite and plural imperatives remain undocumented.
              </p>
            </section>
            <CaseSection />
            <DesireSection />
            <PossessionSection />
            <section id="questions" className="grammar-section">
              <p className="eyebrow">Questions</p>
              <h2>Question words appear before the verb.</h2>
              <Evidence>Observed in these examples</Evidence>
              <div className="grammar-pairs">
                <div><strong>Kuroo kare(n)tho?</strong><span>What are you doing? · masculine</span></div>
                <div><strong>Kuroo kare(n)thi?</strong><span>What are you doing? · feminine</span></div>
                <div><strong>Mere kuroo kye(n)thaa?</strong><span>What is everyone eating?</span></div>
                <div><strong>Ai(n) kee(n) i(n)yo?</strong><span>How are you? · formal or plural</span></div>
              </div>
              <p>
                These questions retain the verb at the end. The exact function
                and placement of question words require additional examples.
              </p>
            </section>
            <ComplexSection />
            <section id="being" className="grammar-section">
              <p className="eyebrow">Descriptions and states</p>
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
              <p className="eyebrow">Field notes</p>
              <h2>What we still need to learn.</h2>
              <ul className="grammar-questions">
                <li>Do the identical present forms always permit both ongoing and habitual interpretations, including with “to eat”?</li>
                <li>How do past forms of <em>kan</em>, <em>kar</em>, and <em>chad</em> change across subjects?</li>
                <li>Do future forms ending in <em>-dhose</em> change with person, number or gender?</li>
                <li>How do <em>natho</em>, <em>nathi</em> and <em>nathaa</em> vary across the full set of negative constructions?</li>
                <li>How are polite and plural commands formed?</li>
                <li>Which other adjectives and participles vary with noun gender or number?</li>
                <li>Do formal and plural second-person forms always coincide?</li>
                <li>Does <em>(n)</em> indicate vowel nasalization or a consonant in each word?</li>
                <li>When does <em>ke</em> appear, and how does its presence interact with <em>hin</em> and <em>hee</em>?</li>
                <li>What conditions the recorded <em>chokre ke</em> and <em>chokro ke</em> alternatives?</li>
                <li>Are <em>ghare(n)</em> and <em>marue(n)</em> number forms, case forms, or both?</li>
                <li>How do <em>kape(n)thaa</em> and <em>kape(n)theu(n)</em> differ?</li>
              </ul>
              <p>
                Another recorded form is <em>Au(n) khadho kadhyose</em>,
                translated as “I ate food yesterday.” It supplies an additional past-time form whose exact relationship to the newer elicited paradigms has not yet been established.
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
