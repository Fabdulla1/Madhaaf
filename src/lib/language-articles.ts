/**
 * Public editorial research based on speaker-supplied East African Kutchi examples.
 * Keep attested strings intact. Interpretations and grammaticality judgments must
 * remain visibly separate from hypotheses; never synthesize new Kutchi sentences.
 */
export type ResearchExample = {
  kutchi: string;
  english: string;
  context?: string;
};
export type ResearchBlock =
  | { type: "text"; text: string }
  | { type: "examples"; label?: string; items: ResearchExample[] }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string }
  | { type: "finding"; label: string; text: string; strength: "attested" | "hypothesis" | "unresolved" }
  | { type: "questions"; items: string[] };
export type ResearchSection = { id: string; title: string; blocks: ResearchBlock[] };
export type ResearchArticle = {
  slug: string;
  number: string;
  subject: string;
  title: string;
  summary: string;
  introduction: string;
  illustration: string;
  illustrationAlt: string;
  wordNotes: { word: string; meaning: string; search?: string }[];
  sections: ResearchSection[];
};

export const researchArticles: ResearchArticle[] = [
  {
    slug: "what-ke-marks",
    number: "01",
    subject: "Case and argument structure",
    title: "What does ke mark? Following a particle through Kutchi sentences",
    summary: "Objects, recipients, experiencers and a crucial demonstrative alternation reveal why ke cannot be translated with one English preposition.",
    introduction: "A short element can carry an outsized grammatical burden. In recorded Mombasa Kutchi sentences, ke accompanies some objects, people receiving something, and people who want something. Yet it is absent from other perfectly natural sentences with objects. The most informative evidence comes not from counting occurrences, but from speakers comparing two ways of saying nearly the same thing.",
    illustration: "/language/research/ke-relations.svg",
    illustrationAlt: "Abstract editorial illustration of several lines linking separate circular forms, representing grammatical relationships.",
    wordNotes: [
      { word: "ke", meaning: "Case-like marker in several documented constructions; the full distribution is unresolved." },
      { word: "hin", meaning: "Demonstrative or pronominal form in the recorded ke constructions." },
      { word: "hee", meaning: "Near demonstrative and, in other contexts, third-person reference." },
      { word: "chokro", meaning: "Boy; compare the attested form chokre." },
      { word: "cheej", meaning: "Thing." },
      { word: "kan", meaning: "Take." },
      { word: "chad", meaning: "Let go, leave it alone." },
      { word: "mukhe", meaning: "First-person form used for recipients and experiencers." },
    ],
    sections: [
      {
        id: "a-paired-test",
        title: "The paired sentence that changed the analysis",
        blocks: [
          { type: "text", text: "One of the clearest pieces of evidence is a controlled contrast supplied by the speaker. Both sentences below mean ‘I am seeing this boy.’ But the version without ke also uses a different demonstrative. That matters: it is not evidence that ke can simply be deleted from the first sentence." },
          { type: "examples", label: "Two acceptable constructions", items: [
            { kutchi: "Au(n) hin chokro ke disa(n)tho", english: "I am seeing this boy.", context: "With hin … ke" },
            { kutchi: "Au(n) hee chokro disa(n)tho", english: "I am seeing this boy.", context: "With hee and without ke" },
          ] },
          { type: "finding", strength: "attested", label: "Speaker judgment", text: "When ke is removed in this example, hin must also become hee for the alternative sentence to be natural. Whether hin is an oblique form of hee is a plausible analysis, not an established rule." },
          { type: "text", text: "A translator that merely inserts or deletes ke would miss this relationship. It would also need to know which noun-phrase shape is appropriate in each construction." },
        ],
      },
      {
        id: "not-every-object",
        title: "Why ‘direct-object marker’ is not enough",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Au(n) hin cheej ke fagaya(n)tho", english: "I am throwing this thing.", context: "Object followed by ke" },
            { kutchi: "Au(n) khadho kya(n)tho", english: "I am eating food.", context: "Ordinary food object without ke" },
            { kutchi: "Au(n) hin kadho ke kya(n)tho", english: "I am eating this food.", context: "Demonstrative-marked food object" },
            { kutchi: "Au(n) paani ke kana(n)tho", english: "I am taking water.", context: "Taking water" },
          ] },
          { type: "text", text: "The speaker said that ke can be omitted when throwing food or water. When taking water, omission changes the interpretation: it can suggest taking water in a medicine-like sense. These are judgments about the supplied contexts, not proof that the same alternation applies to all nouns and verbs." },
          { type: "finding", strength: "unresolved", label: "An open distribution", text: "Verb choice, demonstratives, specificity, and intended meaning may all be relevant. The present corpus cannot distinguish a general case system from a construction-sensitive system." },
        ],
      },
      {
        id: "recipients-experiencers",
        title: "Recipients and people who experience desire",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Hin chokro ke paani dhinose", english: "I gave water to the boy.", context: "ke accompanies the recipient" },
            { kutchi: "Chokro mukhe paani dhine", english: "The boy gave me water.", context: "mukhe is the recipient" },
            { kutchi: "Hin ke paani kapetho", english: "She wants water.", context: "ke accompanies the experiencer" },
            { kutchi: "Mukhe paani kapetho", english: "I want water.", context: "mukhe expresses the experiencer" },
          ] },
          { type: "text", text: "In the giving sentence, water is what changes hands, whereas the boy receives it. In the wanting sentence, the human referent experiences desire while water is the desired item. These uses support describing ke as a case-like marker with recipient and experiencer functions in addition to its object-related uses." },
          { type: "text", text: "The resemblance between hin ke and mukhe also suggests a pronominal-case contrast, but the internal structure of mukhe has not yet been established." },
        ],
      },
      {
        id: "chokro-chokre",
        title: "A case ending that is not obligatory",
        blocks: [
          { type: "examples", items: [
            { kutchi: "chokre ke kapetho", english: "The boy wants it." },
            { kutchi: "chokro ke kapetho", english: "The boy wants it." },
          ] },
          { type: "text", text: "The speaker explicitly accepts both chokre ke and chokro ke in this desire construction. It would therefore be incorrect to program a mandatory change from chokro to chokre whenever ke follows. We can document an alternation, but its connection to case, register, or context is still unknown." },
          { type: "finding", strength: "hypothesis", label: "A possible second ke", text: "In Mukhe kapetho ke hee chokri hadaa ache (‘I want this girl to come here’), ke may introduce a whole subordinate clause. Its similarity in spelling to the nominal case marker does not prove that the two have the same grammatical function." },
        ],
      },
      {
        id: "research-agenda",
        title: "What the evidence permits—and what it doesn't",
        blocks: [
          { type: "text", text: "The strongest descriptive conclusion is modest: ke occurs in several grammatical environments, but neither its obligatory status nor the shape of neighboring words can be specified by one simple rule. This is exactly the sort of result that a growing grammar should preserve rather than simplify away." },
          { type: "questions", items: [
            "Compare hee and hin with the same noun across subject, object, and postpositional positions.",
            "Repeat omission judgments across eat, throw, take, see, and give, holding the noun phrase constant.",
            "Test whether the ke that introduces a desired event can occur after other verbs of saying or thinking.",
            "Record when chokro and chokre are both natural before ke, and whether speakers perceive a difference.",
          ] },
        ],
      },
    ],
  },
  {
    slug: "verbs-agreement-and-time",
    number: "02",
    subject: "Verb morphology",
    title: "One action, many forms: agreement and time in Mombasa Kutchi",
    summary: "Eight elicited verbs reveal recurring person, gender and number patterns—while the past tense and negation complicate the picture.",
    introduction: "The forms of a Kutchi verb change as the participants and time reference change. Comparing eight verbs—dhor, kan, fagai, nikro, vin, kar, chad and sum—reveals a strongly recurring present-tense pattern. The corpus also warns against one tempting conclusion: the endings used for ‘am sleeping’ can also appear in ‘sleep every day.’",
    illustration: "/language/research/verb-patterns.svg",
    illustrationAlt: "Abstract editorial illustration of repeating arcs diverging into different paths, representing related verb forms.",
    wordNotes: [
      { word: "kar", meaning: "Do, perform." },
      { word: "kan", meaning: "Take." },
      { word: "sum", meaning: "Sleep." },
      { word: "vin", meaning: "Go." },
      { word: "dhor", meaning: "Run." },
      { word: "haroj", meaning: "Every day." },
      { word: "savare", meaning: "Tomorrow, in the supplied examples." },
      { word: "kaal", meaning: "Yesterday, in the supplied examples." },
    ],
    sections: [
      {
        id: "present-pattern",
        title: "Person, gender and number in the present",
        blocks: [
          { type: "text", text: "The verb kan (‘take’) provides a clean miniature paradigm. The speaker supplied both masculine and feminine singular forms, different first-, second-, and third-person forms, and plural forms. Other elicited verbs show comparable sequences, though not always identical stems." },
          { type: "table", headers: ["Subject", "Attested form of kan", "Reading"], rows: [
            ["I · masculine", "kana(n)tho", "I am taking"],
            ["I · feminine", "kana(n)thi", "I am taking"],
            ["You · masculine", "kane(n)tho", "You are taking"],
            ["You · feminine", "kane(n)thi", "You are taking"],
            ["He", "kanetho", "He is taking"],
            ["She", "kanethi", "She is taking"],
            ["We", "kano(n)thaa", "We are taking"],
            ["They", "kane(n)thaa", "They are taking"],
          ], caption: "Complete forms are speaker-attested; the boundaries between stem and ending have not been proven." },
          { type: "text", text: "Compare kara(n)tho (‘I am doing’) with kana(n)tho, or suma(n)thi (‘I am sleeping,’ female speaker) with kana(n)thi. The repetition is strong evidence for agreement, but not yet for a universal suffix inventory." },
          { type: "finding", strength: "attested", label: "Orthographic convention", text: "The project writes (n) where an n occurs immediately before th in these forms: kara(n)tho, kane(n)thi, sume(n)thaa. This is a writing convention; it does not establish that the sound is optional." },
        ],
      },
      {
        id: "present-and-habitual",
        title: "An ongoing action and an everyday habit",
        blocks: [
          { type: "examples", label: "The same finite form in two contexts", items: [
            { kutchi: "au(n) suma(n)tho", english: "I am sleeping.", context: "Ongoing action" },
            { kutchi: "au(n) haroj suma(n)tho", english: "I sleep every day.", context: "Habitual action" },
            { kutchi: "au(n) vina(n)tho", english: "I am going.", context: "Ongoing action" },
            { kutchi: "au(n) haroj vina(n)tho", english: "I go every day.", context: "Habitual action" },
          ] },
          { type: "text", text: "Across the elicited verbs, haroj (‘every day’) can provide a habitual reading without changing the present form. The endings cannot therefore be called exclusively progressive on the available evidence. Further discourse examples may reveal additional aspect distinctions." },
        ],
      },
      {
        id: "past-forms",
        title: "The past does not look like one simple suffix",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Au(n) kaal oosyose", english: "I went yesterday. (masculine speaker)" },
            { kutchi: "au(n) kaal ooseise", english: "I went yesterday. (feminine speaker)" },
            { kutchi: "paa(n) kaal oosyasee", english: "We went yesterday." },
            { kutchi: "hinee kaal suthyaa", english: "They slept yesterday." },
          ] },
          { type: "text", text: "The verb vin (‘go’) has present vina(n)tho but past oosyose; sum (‘sleep’) has present suma(n)tho but past suthose. These substantial stem differences could represent irregularity or stem alternation. The gender and number contrasts in past-time clauses deserve a separate study before any automatic conjugator is built." },
        ],
      },
      {
        id: "future-and-negation",
        title: "Future meaning and the grammar of not",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Savare au(n) kandhose", english: "I will take it tomorrow." },
            { kutchi: "Savare he ghare vendhee", english: "She will go home tomorrow." },
            { kutchi: "Natho sume", english: "He is not sleeping." },
            { kutchi: "Nathi sume", english: "She is not sleeping." },
            { kutchi: "Paa(n) kaal na oosyasee", english: "We did not go yesterday." },
            { kutchi: "Nah sum!", english: "Don't sleep!" },
          ] },
          { type: "text", text: "The first-person future forms of several verbs share -dhose, but vendhee in the supplied third-person feminine sentence shows why the first-person pattern cannot be generalized to all subjects. Negation is also construction-sensitive: natho and nathi differ with the subject's gender in the sleeping examples, na occurs with a past verb, and nah precedes an imperative." },
          { type: "finding", strength: "hypothesis", label: "Where agreement lives", text: "Because sume stays unchanged in Natho sume / Nathi sume, agreement may be expressed by a negative auxiliary rather than by the lexical verb in these clauses. This needs testing in other persons and numbers." },
        ],
      },
      {
        id: "next-tests",
        title: "Before building a general conjugation engine",
        blocks: [
          { type: "text", text: "The data support a comparative description of verb forms, not yet an automatic rule that produces every form of every verb. The first priority is to record more speakers and compare verb classes under controlled conditions." },
          { type: "questions", items: [
            "Test feminine and plural future forms for the same three verbs.",
            "Compare ordinary present negatives against affirmative verbs in every person.",
            "Elicit habitual, progressive and completed meanings in identical contexts.",
            "Check the variation dhor/dor and the pronunciation of the (n) notation.",
          ] },
        ],
      },
    ],
  },
  {
    slug: "nouns-gender-and-distance",
    number: "03",
    subject: "Nouns and reference",
    title: "From chokro to chokra: number, gender and distance",
    summary: "The shapes of nouns, adjectives and demonstratives change together—though some forms vary with the surrounding construction.",
    introduction: "The noun chokro (‘boy’) becomes chokra (‘boys’) in the speaker's examples. But the same strategy does not explain every plural: chokri appears alongside chokreu(n), while ghar may remain unchanged or appear as ghare(n). A comparison of nouns and the words around them reveals a richer system of number, grammatical gender and reference.",
    illustration: "/language/research/noun-relations.svg",
    illustrationAlt: "Abstract editorial illustration of one large shape mirrored by several smaller shapes, representing singular and plural contrasts.",
    wordNotes: [
      { word: "chokro", meaning: "Boy; plural chokra is attested." },
      { word: "chokri", meaning: "Girl; plural chokreu(n) is attested." },
      { word: "ghar", meaning: "House." },
      { word: "cheej", meaning: "Thing." },
      { word: "hee", meaning: "This; also used for a nearby referent in some contexts." },
      { word: "hoo", meaning: "That; distal demonstrative in the noun-phrase examples." },
      { word: "hinee", meaning: "These; also a third-person plural reference in other contexts." },
      { word: "hoonee", meaning: "Those; also used in plural/formal reference contexts." },
      { word: "jo", meaning: "Possessive element attested after a noun phrase." },
    ],
    sections: [
      {
        id: "plural-shapes",
        title: "More than one way to be plural",
        blocks: [
          { type: "table", headers: ["Singular", "Recorded plural or contextual form", "Illustration"], rows: [
            ["chokro", "chokra", "boy → boys"],
            ["chokri", "chokreu(n)", "girl → girls"],
            ["cheej", "cheejeu(n)", "thing → things"],
            ["ghar", "ghar / ghare(n)", "house → houses, by context"],
            ["maru", "maru / marue(n)", "man / people, by context"],
          ], caption: "The final two rows are not yet a settled declension: the different forms occur in different constructions." },
          { type: "examples", items: [
            { kutchi: "Chokro sumetho", english: "The boy is sleeping." },
            { kutchi: "Chokra sume(n)thaa", english: "The boys are sleeping." },
            { kutchi: "Chokri sumethi", english: "The girl is sleeping." },
            { kutchi: "Chokreu(n) sume(n)thaa", english: "The girls are sleeping." },
          ] },
          { type: "text", text: "The singular masculine noun chokro and the plural chokra offer one pattern; the feminine pair chokri/chokreu(n) offers another. These examples also contrast singular gender-sensitive finite verbs against a common plural-looking sleeping form." },
        ],
      },
      {
        id: "postposition-forms",
        title: "A plural noun may have more than one shape",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Hinee ghare(n) me", english: "In these houses." },
            { kutchi: "Hinee ghar vadaa i(n)ye", english: "These houses are big." },
            { kutchi: "itra mere ghar i(n)ye", english: "There are so many houses." },
            { kutchi: "hinee marue(n) me", english: "In these people/men.", context: "Speaker's supplied gloss" },
          ] },
          { type: "text", text: "One possible explanation is an oblique form before the postposition me (‘in’). Yet the data also contain ghar without -e(n) in plural contexts. We should not simply label ghare(n) ‘the plural of ghar’ or automatically transform every noun before me." },
          { type: "finding", strength: "hypothesis", label: "Number versus case", text: "The difference between ghar and ghare(n) may reflect a case-conditioned or oblique form, rather than number alone. A controlled subject–object–locative comparison is still missing." },
        ],
      },
      {
        id: "adjective-agreement",
        title: "The describing word changes too",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Hee maru vado ai", english: "This man is big." },
            { kutchi: "Hee bhairee vadi ai", english: "This woman is big." },
            { kutchi: "Hinee ghar vadaa i(n)ye", english: "These houses are big." },
            { kutchi: "Paani thadho ai", english: "The water is cold." },
            { kutchi: "Hee bhairee thadhee ai", english: "This woman is cold." },
          ] },
          { type: "text", text: "The words vado, vadi and vadaa align with masculine, feminine and plural contexts in these sentences. The cold examples contrast thadho with thadhee. This supports gender and number agreement in at least some predicates, without demonstrating that every adjective follows the same pattern." },
        ],
      },
      {
        id: "near-and-far",
        title: "This, that, these and those",
        blocks: [
          { type: "table", headers: ["Reference", "Near", "Far"], rows: [
            ["Singular", "hee", "hoo"],
            ["Plural", "hinee", "hoonee"],
          ], caption: "The contrast is attested with boys running; other pronominal uses require more testing." },
          { type: "examples", items: [
            { kutchi: "Hee chokro dhoretho", english: "This boy is running." },
            { kutchi: "Hoo chokro doretho", english: "That boy is running." },
            { kutchi: "Hinee chokra dore(n)thaa", english: "These boys are running." },
            { kutchi: "Hoonee chokra dore(n)thaa", english: "Those boys are running." },
          ] },
          { type: "text", text: "Another contrast, hee versus hin, occurs when grammatical relationships change. For example, a sentence meaning ‘I am seeing this boy’ has been attested with either hin … ke or hee without ke. That alternation cannot be reduced to proximity alone." },
        ],
      },
      {
        id: "possession",
        title: "Possessive expressions",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Hee mujo ghar ai", english: "This is my house." },
            { kutchi: "Hee mujo bhaa jo ghar ai", english: "This is my brother's house." },
          ] },
          { type: "text", text: "Mujo (‘my’) and hinjo (‘his’) are attested possessive forms, while jo appears after bhaa in a noun-phrase possessor construction. The next step is to determine whether jo varies according to the gender and number of the possessed noun." },
          { type: "questions", items: [
            "Compare ‘my house’ and ‘my things’ with the same possessor.",
            "Use chokro and chokre in controlled subject, object, recipient and location contexts.",
            "Test feminine plural adjective agreement independently of masculine plural nouns.",
          ] },
        ],
      },
    ],
  },
  {
    slug: "wanting-and-experiencers",
    number: "04",
    subject: "Desire and non-finite forms",
    title: "Who wants what? Desire, experiencers and unfinished verbs",
    summary: "Wanting water, wanting many things and wanting to go reveal several constructions rather than one literal English-to-Kutchi rule.",
    introduction: "English uses ‘want’ for a thing, an action and a request for someone else to act. The speaker's Kutchi examples distinguish these meanings. They also challenge the expectation that the verb must agree with the person who wants something: kapetho stays unchanged when the experiencer changes, but the form changes when the wanted items are plural.",
    illustration: "/language/research/desire-constructions.svg",
    illustrationAlt: "Abstract editorial illustration of two paths converging towards an open circular centre, representing different desire constructions.",
    wordNotes: [
      { word: "mukhe", meaning: "First-person experiencer / recipient form in these examples." },
      { word: "kapetho", meaning: "Want predicate in examples with singular desired items." },
      { word: "cheejeu(n)", meaning: "Things; attested plural of cheej." },
      { word: "sum", meaning: "Sleep; compare sumno ai." },
      { word: "vin", meaning: "Go; compare veno ai." },
      { word: "fagai", meaning: "Throw; compare fagayno ai." },
      { word: "ai", meaning: "Form associated with ‘be’; also appears in desire-to-act constructions." },
      { word: "miri(n)", meaning: "Form appearing in people-oriented universal expressions; exact contrast with mere unresolved." },
    ],
    sections: [
      {
        id: "experiencer",
        title: "The person who wants something is marked differently",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Mukhe paani kapetho", english: "I want water." },
            { kutchi: "Hin ke paani kapetho", english: "She wants water." },
            { kutchi: "Hin ke kadho kapetho", english: "He wants food." },
            { kutchi: "Mukhe hee cheej kapetho", english: "I want this thing." },
          ] },
          { type: "text", text: "The first-person experiencer uses mukhe rather than the ordinary action-subject pronoun au(n). A third-person experiencer can appear as hin ke. In these examples kapetho does not change when the experiencer changes. This makes a dative-like experiencer analysis plausible." },
          { type: "finding", strength: "hypothesis", label: "An agreement puzzle", text: "The desired thing, not necessarily the experiencer, may control agreement on the predicate. Showing agreement does not by itself prove which phrase is the syntactic subject." },
        ],
      },
      {
        id: "desired-plurals",
        title: "The desired item can change the verb",
        blocks: [
          { type: "examples", label: "One thing and several things", items: [
            { kutchi: "Mukhe hee cheej kapetho", english: "I want this thing." },
            { kutchi: "Mukhe hinee cheejeu(n) kape(n)thaa", english: "I want these things." },
            { kutchi: "hoonee ke hin cheejeu(n) kape(n)theu(n)", english: "They want these things.", context: "Speaker supplied this as an example of plural agreement" },
          ] },
          { type: "text", text: "The speaker explicitly identifies kape(n)theu(n) as referencing the plurality of cheejeu(n). Another plural context uses kape(n)thaa. We should preserve both forms without choosing a default until we know whether the difference involves agreement, speaker variation, or the phrase's grammatical environment." },
        ],
      },
      {
        id: "wanting-to-act",
        title: "Wanting an action is different from wanting a thing",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Mukhe sumno ai", english: "I want to sleep." },
            { kutchi: "mukhe veno ai", english: "I want to go." },
            { kutchi: "Mukhe fagayno ai", english: "I want to throw it." },
            { kutchi: "Miri(n) ke kheno ai", english: "Everyone wants to eat." },
          ] },
          { type: "text", text: "Here a verb-related form ending in a sequence resembling -no appears before ai. The speaker also supplied cha(n)dno ai for ‘want to spray’. These observations are consistent with a non-finite or verbal-noun construction, but we have not shown that -no can be attached mechanically to every verb." },
        ],
      },
      {
        id: "another-person",
        title: "Wanting another person to act",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Mukhe kapetho ke hee chokri hadaa ache", english: "I want this girl to come here." },
          ] },
          { type: "text", text: "This example has a different configuration: the experiencer wants an event whose actor is the girl. The ke between kapetho and the following clause may introduce the desired proposition. Treating this as the same ke that marks the boy in a giving sentence would be premature." },
          { type: "finding", strength: "unresolved", label: "Two constructions, not one formula", text: "The evidence distinguishes ‘want to go’ from ‘want this girl to come’. Their relationship to infinitives, subordinate clauses, and the copula ai remains to be established." },
        ],
      },
      {
        id: "negative-desire",
        title: "Saying what is not wanted",
        blocks: [
          { type: "examples", items: [
            { kutchi: "paani mukhe natho kape", english: "I don't want water." },
            { kutchi: "paani hin ke natho kape", english: "He doesn't want water." },
            { kutchi: "Mukhe hinee cheejeu(n) nathaa kape(n)", english: "I don't want these things." },
          ] },
          { type: "text", text: "The negative element changes in the plural desired-item example, where nathaa accompanies kape(n). Notice too that paani appears first in the water negatives, unlike in affirmative Mukhe paani kapetho. We should record both orders without claiming a general negation-induced word-order rule." },
          { type: "questions", items: [
            "Test desired things with distinct grammatical genders while holding the experiencer constant.",
            "Compare kape(n)thaa and kape(n)theu(n) in the same context.",
            "Ask whether the action in sumno ai can have a subject different from the experiencer.",
            "Clarify the difference between mere and miri(n) in universal statements.",
          ] },
        ],
      },
    ],
  },
  {
    slug: "connecting-kutchi-clauses",
    number: "05",
    subject: "Syntax and connected speech",
    title: "Beyond the simple sentence: questions, reasons and relative clauses",
    summary: "Attested examples show how speakers ask questions, explain causes, link conditions and describe people through relative clauses.",
    introduction: "A working translator must do more than inflect verbs. It must understand how several ideas belong in one sentence. The elicitation notes include a growing set of complex examples—questions, explanations, conditions, contrasts, and clauses like ‘the boy who is sleeping.’ These examples are the beginnings of a syntax of connected Kutchi speech.",
    illustration: "/language/research/connected-clauses.svg",
    illustrationAlt: "Abstract editorial illustration of two branching paths crossing and joining, representing clauses connected in a sentence.",
    wordNotes: [
      { word: "kadaa", meaning: "Where, in a question." },
      { word: "ku’la", meaning: "Why, in a question." },
      { word: "pun", meaning: "But." },
      { word: "se", meaning: "Because, in the attested clause." },
      { word: "jikee", meaning: "Relative element in the supplied ‘who/whichever’ constructions." },
      { word: "ker", meaning: "Interrogative ‘who’, per speaker explanation." },
      { word: "koi be", meaning: "Whoever, in an attested example." },
      { word: "tha poi", meaning: "So then, in an attested consequence clause." },
    ],
    sections: [
      {
        id: "verb-final",
        title: "The verb often finishes its clause",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Au(n) khadho kya(n)tho", english: "I am eating food." },
            { kutchi: "Au(n) hane ghare vina(n)tho", english: "I am going home now." },
            { kutchi: "kana(n)tho", english: "I'm taking it.", context: "Speaker explicitly permits the omitted pronoun" },
          ] },
          { type: "text", text: "These show a recurrent verb-final tendency, alongside optional subject omission when the subject is recoverable. They do not yet prove that every clause type must be strictly verb-final. The example kana(n)tho is particularly important because the speaker explicitly says au(n) need not be present." },
        ],
      },
      {
        id: "question-words",
        title: "Question words in ordinary clauses",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Kadaa vine(n)tho?", english: "Where are you going?" },
            { kutchi: "Ku’la dhore(n)tho?", english: "Why are you running?" },
            { kutchi: "Kuroo kare(n)tho?", english: "What are you doing? (addressing a man)" },
            { kutchi: "Kuroo kare(n)thi?", english: "What are you doing? (addressing a woman)" },
          ] },
          { type: "text", text: "These examples place the question word before the finite verb and preserve gender agreement in the forms for ‘doing’. More examples are needed to determine where a question word may appear in longer clauses." },
        ],
      },
      {
        id: "reasons-and-contrast",
        title: "Because, but, and the logic between clauses",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Au(n) ghare vina(n)tho se au(n) thake’lo i(n)ya", english: "I am going home because I am tired." },
            { kutchi: "He hadaa ai, pun hoo hudaa ai", english: "He is here, but she is there." },
          ] },
          { type: "text", text: "In the first example, the speaker explicitly identifies se as ‘because’. In the second, pun connects a contrasting claim. These are useful anchors for a translator, though we have not yet tested alternative clause orders or punctuation." },
        ],
      },
      {
        id: "condition-and-consequence",
        title: "If it rains, then I will stay",
        blocks: [
          { type: "examples", items: [
            { kutchi: "savare varsaath pondhi, tha poi au(n) ghare rondhose", english: "If it rains tomorrow, I will stay home." },
          ] },
          { type: "text", text: "The supplied explanation identifies varsaath as rain, pondhi as ‘will fall’, tha poi as ‘so then’, and rondhose as ‘I will stay’. The English translation is conditional, but no separate word corresponding exactly to English if was isolated. It would be a mistake to insert one into the Kutchi text as though it had been attested." },
          { type: "finding", strength: "hypothesis", label: "A conditional relation", text: "The juxtaposition of a rain clause and a consequence clause may convey conditional meaning. Other types of hypothetical and counterfactual sentences are still missing." },
        ],
      },
      {
        id: "relative-reference",
        title: "The boy who is sleeping",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Chokro jikee sutho ai, mujo bha ai", english: "The boy who is sleeping is my brother." },
            { kutchi: "Jikee cheej me ai", english: "In whichever thing it may be in.", context: "Additional use supplied by the speaker" },
            { kutchi: "Koi be sutho ai", english: "Whoever is sleeping.", context: "Speaker's alternative for an indefinite person" },
          ] },
          { type: "text", text: "The speaker explicitly distinguishes jikee in a relative expression from ker, the interrogative word for ‘who’. Koi be is supplied for ‘whoever’. These distinctions are necessary for translating English who into Kutchi: the English spelling covers more than one grammatical role." },
        ],
      },
      {
        id: "unresolved-sleep",
        title: "The same English translation may conceal two constructions",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Chokro sumetho", english: "The boy is sleeping." },
            { kutchi: "Hee chokro sutho ai", english: "This boy is sleeping." },
          ] },
          { type: "text", text: "One sleeping example uses a finite form of sum, another uses sutho with ai. We cannot assume they are interchangeable or that they encode the same aspect. A useful follow-up would hold the subject and situation constant and ask a speaker to compare the two constructions directly." },
          { type: "questions", items: [
            "Test a question where the questioned phrase is not at the beginning of the clause.",
            "Compare a true hypothetical, an expected condition, and a counterfactual event.",
            "Elicit more relative clauses with people and things.",
            "Compare finite sleep forms with sutho ai without changing the subject or time context.",
          ] },
        ],
      },
    ],
  },
];

/**
 * Only speaker-supplied words and transparent inflected-form -> lookup paths.
 * For forms without a verified lemma, search the exact attested surface spelling.
 */
export const dictionaryLookups: Record<string, string> = {
  "au(n)": "au(n)", "paa(n)": "paa(n)", "thu(n)": "thu(n)",
  "hin": "hin", "hee": "hee", "he": "hee", "hoo": "hoo",
  "hinee": "hinee", "hoonee": "hoonee", "mukhe": "mukhe",
  "miri(n)": "miri(n)", "mere": "mere", "chokro": "chokro",
  "chokra": "chokro", "chokre": "chokro", "chokri": "chokri",
  "chokreu(n)": "chokri", "maru": "maru", "bhairee": "bhairee",
  "ghar": "ghar", "ghare": "ghar", "ghare(n)": "ghar",
  "cheejeu(n)": "cheej", "cheeju(n)": "cheej", "cheej": "cheej",
  "khadho": "khadho", "kadho": "khadho",
  "ke": "ke", "me": "me", "ai": "ai", "i(n)ya": "i(n)ya", "i(n)ye": "i(n)ye",
  "kapetho": "kapetho", "kape(n)thaa": "kapetho", "kape(n)theu(n)": "kapetho",
  "natho": "natho", "nathi": "nathi", "nathaa": "nathaa", "na": "na",
  "nah": "nah", "nai": "nai", "kan": "kan", "kana(n)tho": "kan",
  "kana(n)thi": "kan", "kane(n)tho": "kan", "kane(n)thi": "kan",
  "kanetho": "kan", "kanethi": "kan", "kano(n)thaa": "kan",
  "kane(n)thaa": "kan", "kandhose": "kan", "dhinose": "dhinose",
  "dhine": "dhine", "sum": "sum", "sumetho": "sum", "sumethi": "sum",
  "suma(n)tho": "sum", "suma(n)thi": "sum", "sume(n)thaa": "sum",
  "sume": "sum", "sumno": "sum", "sutho": "sutho",
  "kar": "kar", "kara(n)tho": "kar", "kare(n)tho": "kar",
  "kare(n)thi": "kar", "karo(n)thaa": "kar", "karetho": "kar",
  "karethi": "kar", "vin": "vin", "vina(n)tho": "vin", "vine(n)tho": "vin",
  "vendhee": "vin", "vendhose": "vin", "veno": "vin", "oosyose": "vin",
  "ooseise": "vin", "oosyasee": "vin", "dhor": "dhor",
  "dhoretho": "dhor", "doretho": "dhor", "dore(n)thaa": "dhor",
  "dhore(n)tho": "dhor", "dhorantho": "dhor",
  "fagai": "fagai", "fagaya(n)tho": "fagai", "fagayno": "fagai",
  "disa(n)tho": "disa(n)tho", "fagayetho": "fagai",
  "pun": "pun", "se": "se", "savare": "savare", "kaal": "kaal",
  "haroj": "haroj", "hane": "hane", "kadaa": "kadaa",
  "ku’la": "ku’la", "kuroo": "kuroo", "jikee": "jikee",
  "ker": "ker", "jo": "jo", "mujo": "mujo", "hinjo": "hinjo",
  "vado": "vado", "vadi": "vado", "vadaa": "vado",
  "thadho": "thadho", "thadhee": "thadho",
  "bhaa": "bhaa", "acha": "acha", "ache": "ache", "hadaa": "hadaa",
  "hudaa": "hudaa", "chad": "chad", "de": "de", "kheno": "kheno",
  "suthyaa": "sum", "thake’lo": "thake’lo", "varsaath": "varsaath",
  "pondhi": "pondhi", "rondhose": "rondhose",
};
export function researchArticleBySlug(slug: string) {
  return researchArticles.find((article) => article.slug === slug);
}
