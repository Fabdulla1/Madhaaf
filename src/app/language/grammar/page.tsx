import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "Kutchi grammar",
  description: "A preliminary grammar of Mombasa and Ethiopian Kutchi based on attested speaker examples and labeled hypotheses.",
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
          <p className="eyebrow">Language / Grammar research</p>
          <h1>How Kutchi sentences work.</h1>
          <p>
            This guide documents grammatical patterns in Mombasa and Ethiopian Kutchi, one
            recorded sentence at a time. It keeps speaker forms
            separate from proposed grammatical explanations.
          </p>
        </header>
        <div className="grammar-status" role="note">
          <strong>Working grammar · Edition 0.2</strong>
          <Link className="language-guide-byline" href="/about">Grammar research by Farhan Abdulla</Link>
          <span>These examples are preliminary evidence, not a standardized grammar. The working display spelling writes n before th as (n); original forms remain recorded.</span>
        </div>
        <div className="grammar-layout">
          <nav className="grammar-toc" aria-label="On this page">
            <p className="eyebrow">Contents</p>
            <a href="#word-order">01 · Word order</a>
            <a href="#pronouns">02 · Pronouns</a>
            <a href="#verbs">03 · Verb agreement</a>
            <a href="#verb-survey">04 · Eight-verb survey</a>
            <a href="#tense-aspect">05 · Tense and aspect</a>
            <a href="#negation">06 · Negation</a>
            <a href="#commands">07 · Commands</a>
            <a href="#questions">08 · Questions</a>
            <a href="#being">09 · Being &amp; descriptions</a>
            <a href="#postpositions">10 · La and jo</a>
            <a href="#open-questions">11 · Still investigating</a>
          </nav>
          <div className="grammar-articles">
            <section id="word-order" className="grammar-section">
              <p className="eyebrow">01 / Sentence structure</p>
              <h2>Word order is not always verb-final.</h2>
              <Evidence>Three native-speaker-attested word orders</Evidence>
              <p>
                An earlier analysis described Kutchi verbs as tending to come last.
                The speaker accepted three different arrangements of the same elements in a
                sentence with <em>chad</em> (“let go / leave alone”) in at
                least three ways. The verb may come between the subject and
                <em> hin ke</em>, before both, or after both.
              </p>
              <ol className="grammar-order-list" aria-label="Three attested arrangements of the same grammatical elements">
                <li>
                  <span className="grammar-order-list__pattern">Subject → Verb → ke-marked phrase</span>
                  <strong lang="und">Au(n) chada(n)tho hin ke</strong>
                </li>
                <li>
                  <span className="grammar-order-list__pattern">Verb → Subject → ke-marked phrase</span>
                  <strong lang="und">Chada(n)tho au(n) hin ke</strong>
                </li>
                <li>
                  <span className="grammar-order-list__pattern">ke-marked phrase → Subject → Verb</span>
                  <strong lang="und">hin ke au(n) chada(n)tho</strong>
                </li>
              </ol>
              <p className="grammar-fineprint">
                These are the original speaker-supplied variants.
                <em> Au(n)</em> is “I”, <em>chada(n)tho</em> is a form of
                <em> chad</em>, and <em>hin ke</em> is a ke-marked phrase.
                It remains unclear whether changing their order affects
                emphasis, topic, or another aspect of meaning.
              </p>
              <p>
                Some other attested sentences do end in the verb. For example:
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
              <p className="grammar-fineprint">
                Several orders are documented, but not which is
                most frequent in ordinary conversation or whether every verb
                allows them. “Always verb-final” and “verbs tend to be last”
                would both go beyond the available evidence.
              </p>
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
                    <tr><td>mere</td><td>all / everyone in recorded contexts</td><td>its contrast with miri(n) remains under investigation</td></tr>
                    <tr><td>ai(n)</td><td>you</td><td>formal or plural, from a greeting</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="grammar-fineprint">
                Recorded examples use <em>hee</em> for both “he” and “she” in the eating
                sentences, and also for “this” in expressions such as
                <em> hee cheej</em>. Further research is needed on its
                relationship to <em>hin</em> and <em>ke</em>.
              </p>
            </section>
            <section id="verbs" className="grammar-section">
              <p className="eyebrow">03 / Verbs</p>
              <h2>Action verbs agree with their subjects.</h2>
              <Evidence>Attested forms; interpretation provisional</Evidence>
              <p>
                In the recorded examples, present forms of “to eat” and “to do” differ by person,
                gender and number. In the recorded singular forms, masculine
                often ends in <strong>-(n)tho</strong> and feminine in <strong>-(n)thi</strong>;
                the recorded plural forms end in <strong>-(n)thaa</strong> in several paradigms. The (n) notation is used immediately before th where an n was previously written; its exact phonetic realization remains to be verified.
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
                The speaker supplied the final example as “Mere kuroo kye(n)thaa?”
                (“What is everyone eating?”). Later elicitation also distinguishes
                <em> mere</em> from <em>miri(n)</em>; their full distribution
                remains an open question.
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
                <strong>Emerging pattern ,  not a fixed rule yet</strong>
                <p>
                  Compare <em>kara(n)tho / kya(n)tho</em>, <em>kare(n)tho / kye(n)tho</em>,
                  <em> karethi / kyethi</em>, and <em>karo(n)thaa / kyo(n)thaa</em>.
                  The repeated pattern is visible, but it has not been shown
                  where each verb stem ends and a grammatical suffix begins.
                </p>
              </div>
            </section>
            <section id="verb-survey" className="grammar-section">
              <p className="eyebrow">04 / Eight-verb survey</p>
              <h2>A pattern across eight verbs.</h2>
              <Evidence>Speaker-elicited paradigm; spelling convention updated</Evidence>
              <p>
                I collected these present forms with the subjects “I” (masculine),
                “you” (masculine), “he”, “we” and “they”. The full feminine
                singular forms were also elicited for all eight verbs.
                The spelling <strong>(n)</strong> is used wherever the previously
                written n occurs immediately before th. This is a notation
                convention, not a claim that n is always optional.
              </p>
              <div className="grammar-table-wrap">
                <table className="grammar-table">
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
                of the other verbs. These patterns suggest person, gender and number agreement,
                but not every morpheme boundary is identified.
              </p>
              <div className="grammar-note">
                <strong>Pronunciation and transcription to revisit</strong>
                <p>
                  Recorded running forms include <em>dhora(n)tho</em> for the
                  masculine first person but <em>dora(n)thi</em> and
                  <em> dore(n)tho</em> elsewhere. The study retains
                  <em> dhora(n)tho</em> alongside the headword, while
                  leaving open whether dh and d reflect a pronunciation difference.
                </p>
              </div>
            </section>
            <section id="tense-aspect" className="grammar-section">
              <p className="eyebrow">05 / Tense and aspect</p>
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
                forms recur in both ongoing and habitual readings. The data does not yet establish <em>-(n)tho</em> as exclusively progressive.
              </p>
              <h3>First-person future forms</h3>
              <p>
                Eight elicited future forms share the written sequence
                <strong> -dhose</strong>. Agreement has not been established for this sequence.
                Most examples were elicited in first-person future contexts.
              </p>
              <div className="grammar-table-wrap">
                <table className="grammar-table">
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
                In the supplied sentences, <em>savare</em> (“tomorrow”)
                appears before or after the subject, including
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
                Two past forms of <em>chad</em> were recorded,
                <em> chadidinose</em> (“I let go of it yesterday”) and
                <em> chadyavose</em> (“I left it yesterday”).
                Their differences in meaning and construction remain under investigation.
              </p>
            </section>
            <section id="negation" className="grammar-section">
              <p className="eyebrow">06 / Negation</p>
              <h2>Not doing, and not going to do.</h2>
              <Evidence>Observed negatives; scope and syntax unsettled</Evidence>
              <div className="grammar-pairs">
                <div><strong>Au(n) natho kara(n)</strong><span>I am not doing it.</span></div>
                <div><strong>Natho sumaa(n)</strong><span>I am not sleeping.</span></div>
                <div><strong>Au(n) natho chada(n)</strong><span>I am not letting go.</span></div>
                <div><strong>Nah kardhose</strong><span>I will not do it.</span></div>
                <div><strong>Nah vendhose</strong><span>I will not go.</span></div>
                <div><strong>Natho vina(n)tho</strong><span>I am not going. · alternative form</span></div>
              </div>
              <p>
                Recorded present negatives use <em>natho</em>, and
                <em> nah</em> with future forms and commands. The evidence does not yet establish whether either is a simple particle or an
                inflected auxiliary. The study records both <em>natho vina</em>
                and <em>natho vina(n)tho</em>, alongside other supplied
                cases where a negative comes after the lexical verb.
                These alternatives are retained.
              </p>
              <h3>Different negative forms can appear with the same verb</h3>
              <div className="grammar-pairs">
                <div><strong>Natho sume</strong><span>He is not sleeping.</span></div>
                <div><strong>Nathi sume</strong><span>She is not sleeping.</span></div>
                <div><strong>Hee mukhe pe(n)sa natho dye</strong><span>He doesn&apos;t give me money.</span></div>
                <div><strong>Hee mukhe pe(n)sa nai dhine</strong><span>He didn&apos;t give me money.</span></div>
              </div>
              <p>
                The study also records <em>nathaa</em> with plural desired things,
                <em> na</em> in a past negative, <em>nah</em> in negative
                commands, and <em>nai</em> for both past giving and an
                expression meaning there is no food. These are attested
                contexts, not a finished negative conjugation. In the giving
                pair, both the negative and the giving verb change.
              </p>
              <Link className="text-link" href="/language/articles/negation-in-mombasa-kutchi">
                Read the Kutchi negation study <span aria-hidden="true">↗</span>
              </Link>
            </section>
            <section id="commands" className="grammar-section">
              <p className="eyebrow">07 / Imperatives</p>
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
                The recorded commands include <em>kar</em> and <em>khaa</em>.
                Seven of the eight newly elicited singular commands match
                their recorded headwords, while <em>nikar</em> differs
                from <em>nikro</em>. Further elicitation is needed for polite
                and plural commands.
              </p>
            </section>
            <section id="questions" className="grammar-section">
              <p className="eyebrow">08 / Questions</p>
              <h2>Question words appear before the verb.</h2>
              <Evidence>Observed in these examples</Evidence>
              <div className="grammar-pairs">
                <div><strong>Kuroo kare(n)tho?</strong><span>What are you doing? · masculine</span></div>
                <div><strong>Kuroo kare(n)thi?</strong><span>What are you doing? · feminine</span></div>
                <div><strong>Mere kuroo kye(n)thaa?</strong><span>What is everyone eating?</span></div>
                <div><strong>Ai(n) kee(n) i(n)yo?</strong><span>How are you? · formal or plural</span></div>
              </div>
              <p>
                These particular questions place the verb at the end, but
                other examples show that verbs need not be final.
                Longer questions and alternative orders are needed to
                understand where question words can appear.
              </p>
            </section>
            <section id="being" className="grammar-section">
              <p className="eyebrow">09 / Descriptions and states</p>
              <h2>Several forms express “to be.”</h2>
              <Evidence>Forms attested; shared paradigm unconfirmed</Evidence>
              <div className="grammar-pairs">
                <div><strong>Au(n) hadaa i(n)ya</strong><span>I am here.</span></div>
                <div><strong>Mere hadaa i(n)ye</strong><span>Everyone is here.</span></div>
                <div><strong>Paani sare’lo ai</strong><span>The water is rotten.</span></div>
                <div><strong>Mujo maru sare’lo ai</strong><span>My man is rotten.</span></div>
              </div>
              <p>
                The study records <em>i(n)ya</em>, <em>i(n)ye</em>,
                <em> i(n)yo</em> and <em>ai</em> in sentences about
                being or describing a state. Related patterns are plausible,
                but the evidence cannot yet determine whether <em>sare’lo</em> is an
                adjective or participle, or what agreement it shows.
              </p>
            </section>
            <section id="postpositions" className="grammar-section">
              <p className="eyebrow">10 / Postpositions and possession</p>
              <h2>La and jo connect people to things differently.</h2>
              <Evidence>A directly attested distinction; other senses remain open</Evidence>
              <p>
                A speaker-supplied pair distinguishes two different English meanings:
                picking up money <em>for</em> someone and picking up money
                that <em>belongs to</em> them. The first uses <em>la</em>,
                while the second uses <em>jo</em>.
              </p>
              <div className="grammar-pairs">
                <div><strong>Hin la au(n) pe(n)sa kayose</strong><span>I picked up money for him.</span></div>
                <div><strong>Hin jo pe(n)sa au(n) kayose</strong><span>I picked up his money.</span></div>
                <div><strong>khadho la au(n) kana(n)tho</strong><span>for the food, I am taking it.</span></div>
                <div><strong>Hee mujo bhaa jo ghar ai</strong><span>This is my brother&apos;s house.</span></div>
              </div>
              <p>
                <em>La</em> has a beneficiary or food-related “for” reading
                in these sentences; <em>jo</em> links a possessor to
                something possessed. The speaker accepts both <em>khadho la</em> and
                <em>khade la</em>, but their form difference is unresolved.
                An older dictionary note also glossed <em>jo</em> as “for”,
                so that reading remains open pending additional examples.
              </p>
              <Link className="text-link" href="/language/articles/la-and-jo-beneficiary-and-possession">
                Read the full research article about la and jo <span aria-hidden="true">↗</span>
              </Link>
            </section>
            <section id="open-questions" className="grammar-section">
              <p className="eyebrow">11 / Field notes</p>
              <h2>What we still need to learn.</h2>
              <ul className="grammar-questions">
                <li>Do the identical present forms always permit both ongoing and habitual interpretations, including with “to eat”?</li>
                <li>How do past forms of <em>kan</em>, <em>kar</em>, and <em>chad</em> change across subjects?</li>
                <li>Do future forms ending in <em>-dhose</em> change with person, number or gender?</li>
                <li>Which participant or grammatical feature controls the attested <em>natho</em>, <em>nathi</em> and <em>nathaa</em> forms?</li>
                <li>When can <em>jo</em> mean “for” rather than a possessor, and how do <em>khadho</em> and <em>khade</em> vary before <em>la</em>?</li>
                <li>How are polite and plural commands formed?</li>
                <li>How do adjectives and participles agree with nouns?</li>
                <li>Do formal and plural second-person forms always coincide?</li>
                <li>Does <em>(n)</em> indicate vowel nasalization or a consonant in each word?</li>
              </ul>
              <p>
                An earlier recorded form, <em>Au(n) khadho kadhyose</em>, was given for
                “I ate food yesterday.” The earlier form is retained
                until its relationship to newer paradigms is established.
              </p>
              <Link className="text-link" href="/orthography">
                Explore the draft writing guide <span aria-hidden="true">↗</span>
              </Link>
            </section>
          </div>
        </div>
        <div className="grammar-return">
          <Link className="text-link" href="/language/articles">Read the research articles</Link>
          <Link className="text-link" href="/language">Back to Language</Link>
          <Link className="text-link" href="/dictionary">Open the dictionary</Link>
        </div>
      </div>
    </PublicShell>
  );
}
