import Link from "next/link";

type Sentence = readonly [kutchi: string, english: string, dictionaryWord?: string];

function Examples({ items }: { items: readonly Sentence[] }) {
  return (
    <div className="grammar-pairs">
      {items.map(([kutchi, english, dictionaryWord]) => (
        <div key={`${kutchi}|${english}`}>
          <strong>{kutchi}</strong>
          <span>{english}</span>
          {dictionaryWord && <Link className="grammar-example-link" href={`/dictionary?q=${encodeURIComponent(dictionaryWord)}`}>Search dictionary for “{dictionaryWord}” <span aria-hidden="true">↗</span></Link>}
        </div>
      ))}
    </div>
  );
}

function DictionaryLink({ word }: { word: string }) {
  return <Link className="text-link" href={`/dictionary?q=${encodeURIComponent(word)}`}>Search dictionary for “{word}” <span aria-hidden="true">↗</span></Link>;
}

function EvidenceNote({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grammar-note"><strong>{label}</strong><p>{children}</p></div>;
}

export function DemonstrativesSection() {
  return (
    <section id="demonstratives" className="grammar-section" aria-labelledby="demonstratives-title">
      <p className="eyebrow">Reference / Demonstratives</p>
      <h2 id="demonstratives-title">This, that, these and those.</h2>
      <span className="grammar-evidence">Speaker-attested contrasts</span>
      <p className="grammar-table-cue">Scroll horizontally to see all table columns.</p>
      <div className="grammar-table-wrap" role="region" aria-label="Demonstrative forms" tabIndex={0}>
        <table className="grammar-table">
          <caption>Recorded proximal and distal forms</caption>
          <thead><tr><th scope="col">Number</th><th scope="col">Near</th><th scope="col">Far</th></tr></thead>
          <tbody>
            <tr><th scope="row">Singular</th><td>hee</td><td>hoo</td></tr>
            <tr><th scope="row">Plural</th><td>hinee</td><td>hoonee</td></tr>
          </tbody>
        </table>
      </div>
      <Examples items={[
        ["Hee chokro dhoretho", "This boy is running.", "hee"],
        ["Hoo chokro doretho", "That boy is running.", "hoo"],
        ["Hinee chokra dore(n)thaa", "These boys are running.", "hinee"],
        ["Hoonee chokra dore(n)thaa", "Those boys are running.", "hoonee"],
      ]} />
      <p>The recorded forms contrast distance and number. The spellings <em>dhoretho</em> and <em>doretho</em> are retained as supplied; their relationship needs further checking.</p>
      <EvidenceNote label="Hypothesis · hin may be a conditioned form">
        <em>Hin</em> occurs before <em>ke</em> in some constructions, while <em>hee</em> occurs in a corresponding sentence without <em>ke</em>. An oblique analysis is plausible but not established. See the <a href="#case-marking">case marking examples</a>.
      </EvidenceNote>
      <h3>Addressing one person or several</h3>
      <Examples items={[
        ["Kee(n) i(n)ye", "How are you? · close male friend"],
        ["Kee(n) i(n)yo", "How are you? · respected older person"],
        ["Kee(n) i(n)yo", "How are you? · several people"],
      ]} />
      <p>These greetings show a formal or plural contrast in the recorded contexts; they do not establish a full second-person copula paradigm.</p>
      <DictionaryLink word="hee" />
    </section>
  );
}

export function NounsSection() {
  return (
    <section id="nouns" className="grammar-section" aria-labelledby="nouns-title">
      <p className="eyebrow">Noun morphology</p>
      <h2 id="nouns-title">Nouns vary with number and context.</h2>
      <span className="grammar-evidence">Recorded contrasts; case analysis provisional</span>
      <p className="grammar-table-cue">These recorded noun forms may be plural or contextual. Scroll horizontally to see all table columns.</p>
      <div className="grammar-table-wrap" role="region" aria-label="Noun form contrasts" tabIndex={0}>
        <table className="grammar-table">
          <caption>Attested noun forms; the right column is not always a simple plural</caption>
          <thead><tr><th scope="col">Singular</th><th scope="col">Plural or contextual form</th></tr></thead>
          <tbody>
            <tr><th scope="row">chokro</th><td>chokra</td></tr>
            <tr><th scope="row">chokri</th><td>chokreu(n)</td></tr>
            <tr><th scope="row">cheej</th><td>cheejeu(n)</td></tr>
            <tr><th scope="row">ghar</th><td>ghar / ghare(n)</td></tr>
            <tr><th scope="row">maru</th><td>maru / marue(n)</td></tr>
          </tbody>
        </table>
      </div>
      <Examples items={[
        ["Chokro sumetho", "The boy is sleeping.", "chokro"],
        ["Chokri sumethi", "The girl is sleeping.", "chokri"],
        ["Chokra sume(n)thaa", "The boys are sleeping.", "chokra"],
        ["Chokreu(n) sume(n)thaa", "The girls are sleeping.", "chokreu(n)"],
        ["Hinee ghare(n) me", "In these houses.", "ghar"],
        ["itra mere ghar i(n)ye", "There are so many houses.", "ghar"],
      ]} />
      <EvidenceNote label="Hypothesis · an -e(n) form may depend on context">
        The relationship of <em>ghar</em> and <em>ghare(n)</em>, or <em>maru</em> and <em>marue(n)</em>, may involve oblique or case-conditioned morphology. The available sentences do not verify a general declension pattern.
      </EvidenceNote>
      <DictionaryLink word="chokro" />
    </section>
  );
}

export function AdjectivesSection() {
  return (
    <section id="adjectives" className="grammar-section" aria-labelledby="adjectives-title">
      <p className="eyebrow">Describing nouns</p>
      <h2 id="adjectives-title">Some adjectives change form.</h2>
      <span className="grammar-evidence">Attested gender and number contrasts</span>
      <Examples items={[
        ["Hee ghar vado ai", "This house is big.", "vado"],
        ["Hinee ghar vadaa i(n)ye", "These houses are big.", "vadaa"],
        ["Hee bhairee vadi ai", "This woman is big.", "vadi"],
        ["Hee maru vado ai", "This man is big.", "maru"],
        ["Paani thadho ai", "The water is cold.", "thadho"],
        ["Hee bhairee thadhee ai", "This woman is cold.", "thadhee"],
      ]} />
      <p><em>Vado / vadi / vadaa</em> and <em>thadho / thadhee</em> show form contrasts alongside gender or number differences in these sentences. It remains to be tested which adjectives follow similar patterns.</p>
      <DictionaryLink word="vado" />
    </section>
  );
}

export function CaseSection() {
  return (
    <section id="case-marking" className="grammar-section" aria-labelledby="case-title">
      <p className="eyebrow">Case marking and postpositions</p>
      <h2 id="case-title">The environments of <em>ke</em>.</h2>
      <span className="grammar-evidence">Whole constructions attested; functions under investigation</span>
      <p>The recorded sentences place <em>ke</em> in several environments. They do not support a single rule that every direct object needs <em>ke</em>, nor do they show that it can simply be omitted without other changes.</p>
      <h3>Object-related and recipient constructions</h3>
      <Examples items={[
        ["Au(n) hin cheej ke fagaya(n)tho", "I am throwing this thing.", "ke"],
        ["Hin chokro ke paani dhinose", "I gave water to the boy.", "dhinose"],
        ["Au(n) khadho kya(n)tho", "I am eating food.", "khadho"],
        ["Au(n) hin kadho ke kya(n)tho", "I am eating this food.", "ke"],
      ]} />
      <p>The last two food sentences show that the conditions for object-related marking cannot yet be reduced to one simple rule. The spelling <em>kadho</em> in the second sentence is kept as supplied.</p>
      <h3>The demonstrative changes too</h3>
      <Examples items={[
        ["Au(n) hin chokro ke disa(n)tho", "I am seeing this boy.", "hin"],
        ["Au(n) hee chokro disa(n)tho", "I am seeing this boy.", "hee"],
      ]} />
      <p>Both complete sentences were judged acceptable. Removing <em>ke</em> coincides with changing <em>hin</em> to <em>hee</em>. The mixed combinations have not been confirmed.</p>
      <EvidenceNote label="Hypothesis · demonstrative form may reflect case">
        <em>Hin</em> may be an oblique form and <em>hee</em> a different form. Further judgments are needed before assigning either a fixed case value.
      </EvidenceNote>
      <h3>Experiencer and possible clause introducer</h3>
      <Examples items={[
        ["Hin ke paani kapetho", "She wants water.", "ke"],
        ["chokre ke kapetho", "The boy wants it.", "chokre"],
        ["chokro ke kapetho", "The boy wants it.", "chokro"],
        ["Mukhe kapetho ke hee chokri hadaa ache", "I want this girl to come here.", "ke"],
      ]} />
      <p>In the wanting sentences, the boy or <em>hin</em> is an experiencer, not necessarily an object. Both <em>chokre ke</em> and <em>chokro ke</em> were accepted with the same supplied translation; their distribution is unresolved. The final <em>ke</em> may introduce a complement clause rather than mark a noun phrase.</p>
      <DictionaryLink word="ke" />
    </section>
  );
}

export function DesireSection() {
  return (
    <section id="desire" className="grammar-section" aria-labelledby="desire-title">
      <p className="eyebrow">Experiencers and desire</p>
      <h2 id="desire-title">Wanting a thing or an action.</h2>
      <span className="grammar-evidence">Recorded sentences; agreement analysis tentative</span>
      <h3>Wanting a thing</h3>
      <Examples items={[
        ["Mukhe paani kapetho", "I want water.", "mukhe"],
        ["Hin ke paani kapetho", "She wants water.", "kapetho"],
        ["Mukhe hee cheej kapetho", "I want this thing.", "cheej"],
        ["Mukhe hinee cheejeu(n) kape(n)thaa", "I want these things.", "cheejeu(n)"],
        ["hoonee ke hin cheejeu(n) kape(n)theu(n)", "They want these things.", "kape(n)theu(n)"],
      ]} />
      <p>The desire predicate appears to vary with the desired item’s number. Both <em>kape(n)thaa</em> and <em>kape(n)theu(n)</em> are retained; their exact difference remains unresolved.</p>
      <h3>Wanting to do something</h3>
      <Examples items={[
        ["Mukhe sumno ai", "I want to sleep.", "sumno"],
        ["Mukhe veno ai", "I want to go.", "veno"],
        ["Mukhe fagayno ai", "I want to throw it.", "fagayno"],
        ["Miri(n) ke kheno ai", "Everyone wants to eat.", "miri(n)"],
      ]} />
      <EvidenceNote label="Hypothesis · action-related forms before ai">
        Forms such as <em>sumno</em>, <em>veno</em>, <em>fagayno</em> and <em>kheno</em> may involve non-finite morphology. These examples do not establish a universal infinitive <em>-no</em> suffix.
      </EvidenceNote>
      <DictionaryLink word="mukhe" />
    </section>
  );
}

export function PossessionSection() {
  return (
    <section id="possession" className="grammar-section" aria-labelledby="possession-title">
      <p className="eyebrow">Possession</p>
      <h2 id="possession-title">Whose house?</h2>
      <span className="grammar-evidence">Attested possessive constructions</span>
      <Examples items={[
        ["Mujo ghar", "My house.", "mujo"],
        ["Hinjo ghar", "His house.", "hinjo"],
        ["Mujo bhaa jo ghar", "My brother’s house.", "jo"],
      ]} />
      <p><em>Jo</em> appears in a possessive construction. Whether it changes according to the gender or number of the possessed noun remains untested.</p>
      <DictionaryLink word="mujo" />
    </section>
  );
}

export function ComplexSection() {
  return (
    <section id="complex-sentences" className="grammar-section" aria-labelledby="complex-title">
      <p className="eyebrow">Connected thoughts</p>
      <h2 id="complex-title">Reasons, conditions and relative clauses.</h2>
      <span className="grammar-evidence">Speaker-supplied complete sentences</span>
      <div className="grammar-example">
        <p className="grammar-example__kutchi">Au(n) ghare vina(n)tho se au(n) thake’lo i(n)ya</p>
        <p>I am going home because I am tired.</p>
        <div className="grammar-breakdown" aria-label="Phrase-by-phrase analysis">
          <span><strong>Au(n) ghare vina(n)tho</strong><small>going home</small></span>
          <span><strong>se</strong><small>cause · because</small></span>
          <span><strong>au(n) thake’lo i(n)ya</strong><small>I am tired</small></span>
        </div>
      </div>
      <Examples items={[
        ["Mukhe kheno ai, pun khadho nai", "I want to eat, but there is no food.", "pun"],
        ["savare varsaath pondhi, tha poi au(n) ghare rondhose", "If it rains tomorrow, I will stay home.", "tha poi"],
        ["Chokro jikee sutho ai, mujo bha ai", "The boy who is sleeping is my brother.", "jikee"],
      ]} />
      <p><em>Pun</em> occurs in a contrast, <em>se</em> in a cause, <em>tha poi</em> in a consequence, and <em>jikee</em> in a relative clause. Their precise syntactic roles need more examples.</p>
      <p className="grammar-fineprint">The dictionary currently has more than one <em>pun</em> entry. Its search link is for discovery, not a claim that those entries have been merged.</p>
      <h3>Question and relative words</h3>
      <p className="grammar-table-cue">Scroll horizontally to see all table columns.</p>
      <div className="grammar-table-wrap" role="region" aria-label="Recorded question and relative words" tabIndex={0}>
        <table className="grammar-table">
          <caption>Recorded meanings in their supplied contexts</caption>
          <thead><tr><th scope="col">Kutchi</th><th scope="col">English</th></tr></thead>
          <tbody>
            <tr><th scope="row">ker</th><td>interrogative who</td></tr>
            <tr><th scope="row">jikee</th><td>relative who or which</td></tr>
            <tr><th scope="row">koi be</th><td>whoever in an attested example</td></tr>
            <tr><th scope="row">kadaa</th><td>where</td></tr>
            <tr><th scope="row">ku’la</th><td>why</td></tr>
          </tbody>
        </table>
      </div>
      <p>The listed meanings do not make these expressions interchangeable. We do not have a complete sentence for <em>koi be</em> in this set of notes, so none is reconstructed here.</p>
      <DictionaryLink word="jikee" />
    </section>
  );
}
