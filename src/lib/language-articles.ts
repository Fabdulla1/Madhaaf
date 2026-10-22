/**
 * Public editorial research based on speaker-supplied East African Kutchi examples.
 * Keep attested strings intact. Interpretations and grammaticality judgments must
 * remain visibly separate from hypotheses; never synthesize new Kutchi sentences.
 */
import { octoberResearchArticles } from "./language-articles-october-2026";

export type ResearchExample = {
  kutchi: string;
  english: string;
  context?: string;
  /** Indicates a word-order annotation rather than a speaker-provided English translation. */
  captionKind?: "structure" | "elicitation";
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
  /** Retrospective editorial series date; NOT the first live web publication date. */
  editorialDate: string;
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
    slug: "vathe-possession-and-association",
    editorialDate: "2026-10-22",
    number: "V1",
    subject: "Possession and postpositions",
    title: "Vathe: possession and association in Mombasa Kutchi",
    summary: "Five speaker-supplied examples show vathe with person references, affirmative and negative possession, and an item associated with a person.",
    introduction: "Vathe occurs after a person-reference in the recorded examples. English translations include having something and something being with someone. These are speaker-attested sentences; the postposition analysis is provisional and does not establish ownership or a full possession paradigm.",
    illustration: "/language/research/ke-relations.svg",
    illustrationAlt: "Abstract illustration of relationships between linked forms; not linguistic evidence.",
    wordNotes: [
      { word: "vathe", meaning: "With; in the possession or company of (provisional postposition classification)." },
      { word: "mu", meaning: "First-person form in mu vathe; the grammatical relationship to other first-person forms requires analysis." },
      { word: "hin", meaning: "Third-person form here, translated as him or her depending on context." },
      { word: "nai", meaning: "Negation in the recorded possession examples." },
      { word: "pe(n)sa", meaning: "Money." },
      { word: "chopri", meaning: "Book." },
      { word: "ai", meaning: "Affirmative predicate form in two examples; its distribution is not yet established." },
      { word: "i(n)ye", meaning: "Affirmative predicate form in the money example; its distribution is not yet established." },
    ],
    sections: [
      {
        id: "speaker-examples",
        title: "The attested expressions",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Hin vathe nai", english: "It is not with him; he does not have it; he/she is not with him.", context: "Original reported translations; referents depend on context." },
            { kutchi: "Mu vathe nai", english: "I don't have it." },
            { kutchi: "Hin vathe pe(n)sa i(n)ye", english: "He has money." },
            { kutchi: "Chopri hin vathe ai", english: "The book is with her." },
            { kutchi: "Hin vathe ai", english: "He has it.", context: "The speaker explicitly accepted this interpretation." },
          ] },
          { type: "finding", strength: "attested", label: "Speaker evidence", text: "Vathe follows mu and hin in these examples. Affirmatives include ai and i(n)ye, and negatives include nai without an overt positive predicate." },
        ],
      },
      {
        id: "working-analysis",
        title: "A provisional construction",
        blocks: [
          { type: "text", text: "The examples support treating vathe as a person-associated relational element, tentatively a postposition. A useful descriptive template is: person-reference + vathe + optional overt item + affirmative or negative predicate. Chopri hin vathe ai places the item before the vathe phrase, while hin vathe pe(n)sa i(n)ye places it after. This establishes two attested arrangements, not free word order." },
          { type: "finding", strength: "hypothesis", label: "Possession and association", text: "Vathe may express physical association, availability or possession rather than necessarily legal ownership. Whether accompaniment of another person is fully productive remains untested." },
          { type: "finding", strength: "unresolved", label: "Predicate selection", text: "Why one affirmative clause uses i(n)ye and others use ai is not known. Do not attribute the difference to number, gender or tense without controlled contrasts." },
          { type: "text", text: "Do not merge mu vathe with the distinct attested experiencer expression mukhe used with kap ('want'). The alternation may involve different grammatical constructions and needs direct testing." },
        ],
      },
      {
        id: "future-tests",
        title: "Questions for further elicitation",
        blocks: [
          { type: "questions", items: [
            "Compare singular and plural possessed items with the same person-reference to test ai against i(n)ye.",
            "Test whether vathe also expresses a person accompanying someone, without an ownership reading.",
            "Compare a physically held item with a legally owned but absent item.",
            "Test whether mu, hin and other person forms consistently occur before vathe.",
            "Check whether an overt possessed noun changes the interpretation of nai.",
          ] },
        ],
      },
    ],
  },
  {
    slug: "what-ke-marks",
    editorialDate: "2026-03-12",
    number: "01",
    subject: "Case and argument structure",
    title: "What does ke mark? Following a particle through Kutchi sentences",
    summary: "The uses of ke vary across object, recipient and experiencer constructions. This study compares the recorded forms and identifies questions that need further testing.",
    introduction: "The particle ke appears in several environments in the recorded Mombasa Kutchi sentences. It can follow an object, a recipient or a person expressing desire. In some examples, removing ke requires a change elsewhere in the phrase. The study sets these contrasts side by side without assuming that one rule accounts for all of them.",
    illustration: "/language/research/ke-relations.svg",
    illustrationAlt: "Abstract editorial illustration of several lines linking separate circular forms, representing grammatical relationships.",
    wordNotes: [
      { word: "ke", meaning: "Case-like marker in several documented constructions; the full distribution is unresolved." },
      { word: "au(n)", meaning: "I; first-person pronoun in these clauses." },
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
          { type: "text", text: "Two sentences translated as ‘I am seeing this boy’ differ in more than the presence of ke. The demonstrative changes as well. Both complete sentences must therefore be considered in the analysis." },
          { type: "examples", label: "Two acceptable constructions", items: [
            { kutchi: "Au(n) hin chokro ke disa(n)tho", english: "I am seeing this boy.", context: "With hin … ke" },
            { kutchi: "Au(n) hee chokro disa(n)tho", english: "I am seeing this boy.", context: "With hee and without ke" },
          ] },
          { type: "finding", strength: "attested", label: "Speaker judgment", text: "The speaker judged that removing ke from this example requires changing hin to hee. This is an attested grammaticality judgment. A direct-versus-oblique distinction is a possible explanation, but it has not been established by this pair alone." },
          { type: "text", text: "These examples also matter for future translation tools. Treating each word as independently replaceable may obscure grammatical relationships expressed by the whole construction." },
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
          { type: "text", text: "Additional verb comparisons show that ke can be omitted when throwing food or water. Omitting it when taking water, however, was reported to change the intended sense toward something like taking medicine. These judgments apply to the recorded sentences; they do not yet establish a universal rule." },
          { type: "finding", strength: "unresolved", label: "An open distribution", text: "The cause of this alternation is unresolved. Relevant factors may include the verb, specificity, the demonstrative or intended meaning. Controlled minimal pairs are needed to test an object-marking analysis." },
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
          { type: "text", text: "In the giving example, ke accompanies the recipient; in the wanting example, it accompanies the experiencer. These are different grammatical relationships. A case-like analysis with possible object, recipient and experiencer functions is plausible but provisional." },
          { type: "text", text: "The forms hin ke and mukhe may be related. Mukhe appears in the attested ‘I want water’ and ‘the boy gave me water’ constructions. Its internal morphological structure has not yet been established." },
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
          { type: "text", text: "Both chokre ke kapetho and chokro ke kapetho were accepted for ‘the boy wants it’. Neither should be normalized away. Further elicitation can test whether context, emphasis or speaker variation explains the difference." },
          { type: "finding", strength: "hypothesis", label: "A possible second ke", text: "The sentence Mukhe kapetho ke hee chokri hadaa ache, ‘I want this girl to come here’, introduces a possible clause-linking use of ke. That analysis is kept separate from recipient marking until additional clauses are tested." },
        ],
      },
      {
        id: "order-with-ke",
        title: "A ke-marked phrase can appear in more than one position",
        blocks: [
          { type: "text", text: "The speaker supplied three accepted arrangements of a construction containing chad (‘let go / leave alone’). The subject, verb and ke-marked phrase appear in different orders. Differences in emphasis or topic have not yet been tested. The labels below identify structure, not separate English translations." },
          { type: "examples", label: "Three accepted arrangements ,  constituent-order labels, not translations", items: [
            { kutchi: "Au(n) chada(n)tho hin ke", english: "Subject → Verb → ke-marked phrase", captionKind: "structure" },
            { kutchi: "Chada(n)tho au(n) hin ke", english: "Verb → Subject → ke-marked phrase", captionKind: "structure" },
            { kutchi: "hin ke au(n) chada(n)tho", english: "ke-marked phrase → Subject → Verb", captionKind: "structure" },
          ] },
          { type: "finding", strength: "attested", label: "A word-order correction", text: "An earlier analysis treated Kutchi verbs as tending to appear last. The recorded chad examples establish that verb-final order is not obligatory in this construction. They do not establish that every verb permits the same options." },
        ],
      },
      {
        id: "research-agenda",
        title: "What the evidence permits, and what it doesn't",
        blocks: [
          { type: "text", text: "The recorded forms and their confirmed contrasts can be published as evidence. A universal account of ke cannot yet be supported. Open questions should remain explicit rather than being replaced by an untested rule." },
          { type: "questions", items: [
            "Compare hee and hin with the same noun across subject, object, and postpositional positions.",
            "Repeat omission judgments across eat, throw, take, see, and give, holding the noun phrase constant.",
            "Test whether the ke that introduces a desired event can occur after other verbs of saying or thinking.",
            "Record when chokro and chokre are both natural before ke, and whether speakers perceive a difference.",
            "Test whether the reordered chad examples differ in emphasis, contrast or what is already known to listeners.",
            "Try the same three relative orders with kan, fagai and other verbs, then test clauses without ke.",
          ] },
        ],
      },
    ],
  },
  {
    slug: "verbs-agreement-and-time",
    editorialDate: "2026-05-08",
    number: "02",
    subject: "Verb morphology",
    title: "One action, many forms: agreement and time in Mombasa Kutchi",
    summary: "Eight verb paradigms suggest recurring distinctions in person, gender and number. Past forms and negative constructions also reveal unresolved patterns.",
    introduction: "This study compares forms of kar (‘do’), kan (‘take’) and six other verbs across recorded subjects. Several forms suggest agreement for person, gender and number, while some past forms show changes beyond a single suffix. The tables retain complete speaker-attested forms because their internal segmentation remains under study.",
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
          { type: "text", text: "The verb kan (‘take’) provides comparable forms across subjects. The elicitation records masculine and feminine singular forms, person differences and plural forms. Similar patterns appear with other verbs, even where the stem itself varies." },
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
          { type: "text", text: "Forms such as kara(n)tho and kana(n)tho, or suma(n)thi and kana(n)thi, suggest recurring agreement patterns. Their internal divisions between stem and ending remain unconfirmed, so full recorded words are given in the table." },
          { type: "finding", strength: "attested", label: "Orthographic convention", text: "The working spelling convention uses (n) where a written n immediately precedes th, as in kara(n)tho, kane(n)thi and sume(n)thaa. This is a transcription decision, not evidence that the sound is necessarily optional." },
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
          { type: "text", text: "The same recorded present form can express an ongoing action or a regular habit. Haroj (‘every day’) changes the time interpretation without changing the verb. These endings should not yet be described as exclusively progressive." },
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
          { type: "text", text: "The past forms require separate analysis. Vin (‘go’) has vina(n)tho in the present and oosyose in one masculine first-person past context; sum (‘sleep’) has suma(n)tho and suthose. These contrasts cannot be explained by attaching a single suffix without additional evidence." },
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
          { type: "text", text: "Several first-person future forms contain -dhose, but ‘she will go home tomorrow’ was translated with vendhee. The first-person pattern cannot yet be generalized to every subject. The negative examples also show distinct natho, nathi, na and nah environments." },
          { type: "finding", strength: "hypothesis", label: "Where agreement lives", text: "The lexical verb sume is unchanged in Natho sume and Nathi sume. Agreement may therefore be carried partly by a negative auxiliary. This is a hypothesis to test with additional verbs and plural subjects." },
        ],
      },
      {
        id: "next-tests",
        title: "Before building a general conjugation engine",
        blocks: [
          { type: "text", text: "The verb tables record attested forms rather than providing a productive conjugation engine. Repeated elicitation with other speakers is needed before the patterns can be generalized, particularly where stem changes are irregular." },
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
    editorialDate: "2026-07-02",
    number: "03",
    subject: "Nouns and reference",
    title: "From chokro to chokra: number, gender and distance",
    summary: "Plural nouns and descriptive words show variation by number, gender and grammatical context. The available evidence does not yet support a single plural rule.",
    introduction: "The examples include chokro and chokra, chokri and chokreu(n), and both ghar and ghare(n) in different constructions. Demonstratives and adjectives also vary alongside these nouns. The study compares the forms without treating one observed alternation as a rule for the language as a whole.",
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
          { type: "text", text: "The recorded pairs include chokro with chokra and chokri with chokreu(n). The accompanying verbs also differ between singular and plural subjects. These examples suggest a number pattern but are insufficient for a complete declension." },
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
          { type: "text", text: "Hinee ghare(n) me was supplied for ‘in these houses’, while Hinee ghar vadaa i(n)ye was supplied for ‘these houses are big’. Since ghar appears in a plural context, ghare(n) cannot simply be labeled the plural form without considering the construction." },
          { type: "finding", strength: "hypothesis", label: "Number versus case", text: "The ending -e(n) may be associated with forms used before me (‘in’), perhaps through an oblique or case-conditioned pattern. The same noun must be tested in subject, object and location phrases before this can be established." },
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
          { type: "text", text: "Vado with a man, vadi with a woman and vadaa with several houses suggest agreement in descriptive expressions. The recorded ‘cold’ forms thadho and thadhee provide another contrast. Other adjectives require independent testing." },
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
          { type: "text", text: "In running examples, hee and hoo distinguish ‘this’ from ‘that’, while hinee and hoonee distinguish ‘these’ from ‘those’. Another pair contrasts hin ... ke with hee without ke, suggesting that demonstratives may also vary with grammatical function." },
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
          { type: "text", text: "The attested possessive expressions include mujo ghar (‘my house’), mujo bhaa jo ghar (‘my brother’s house’) and hinjo ghar (‘his house’). Agreement with feminine or plural possessed nouns remains to be tested." },
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
    editorialDate: "2026-09-14",
    number: "04",
    subject: "Desire and non-finite forms",
    title: "Who wants what? Desire, experiencers and possible non-finite forms",
    summary: "Expressions for wanting a thing, wanting several things and wanting an action involve different recorded constructions.",
    introduction: "Kutchi sentences translated with English ‘want’ do not all use the same structure. Mukhe occurs in first-person desire constructions, while kapetho is unchanged in some examples with different experiencers. A plural desired item can produce a different predicate form. These contrasts motivate a closer analysis of experiencer marking and agreement.",
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
          { type: "text", text: "Mukhe paani kapetho does not contain the action-subject pronoun au(n). Hin ke paani kapetho changes the experiencer but retains kapetho. This suggests that the person expressing desire may be marked with a dative-like form." },
          { type: "finding", strength: "hypothesis", label: "An agreement puzzle", text: "The desired item may contribute to the predicate's agreement. That would differ from the agreement found with ordinary action verbs. The grammatical status of each phrase remains to be established." },
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
          { type: "text", text: "The plural desiderative examples include kape(n)thaa and kape(n)theu(n). The speaker linked a plural form to cheejeu(n), but the distribution of the two endings is unresolved. Both are retained rather than normalized." },
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
          { type: "text", text: "The recorded desire-for-action forms include sumno ai, veno ai, fagayno ai and cha(n)dno ai. They suggest a possible -no ending, but additional verbs and speakers are needed before treating it as productive." },
        ],
      },
      {
        id: "another-person",
        title: "Wanting another person to act",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Mukhe kapetho ke hee chokri hadaa ache", english: "I want this girl to come here." },
          ] },
          { type: "text", text: "Mukhe kapetho ke hee chokri hadaa ache expresses wanting another person to perform an action. The ke introducing the second clause may be a clause-linking element; further examples are needed." },
          { type: "finding", strength: "unresolved", label: "Two constructions, not one formula", text: "Wanting to perform an action and wanting another person to act may involve distinct non-finite or subordinate constructions. Their internal grammar requires further elicitation." },
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
          { type: "text", text: "The negative desire examples put paani before the experiencer, while the affirmative Mukhe paani kapetho begins with mukhe. A plural negative also uses nathaa with kape(n). Since the contexts are not controlled minimal pairs, the data does not establish that negation causes this word-order difference." },
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
    editorialDate: "2026-10-19",
    number: "05",
    subject: "Syntax and connected speech",
    title: "Beyond the simple sentence: questions, reasons and relative clauses",
    summary: "Attested questions, reasons, relative clauses and reordered sentence elements are compared without assuming that verbs must always occur last.",
    introduction: "A dictionary cannot by itself capture clause structure. In the recorded chad (‘let go’) constructions, the verb occurs first, between other elements or last. The data also includes questions, explanatory clauses and relative expressions. The aim is to document the patterns and identify which word-order differences require further testing.",
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
      { word: "au(n)", meaning: "I; first-person singular subject in these examples." },
      { word: "chad", meaning: "Let go or leave alone; chada(n)tho is an attested inflected form." },
      { word: "hin", meaning: "A pronominal or demonstrative form used with ke here." },
      { word: "ke", meaning: "Case-like element; the exact role of hin ke remains under investigation." },
    ],
    sections: [
      {
        // Retain the original ID so existing links into this article still work.
        id: "verb-final",
        title: "The verb can appear in different positions",
        blocks: [
          { type: "text", text: "An earlier description treated Kutchi as generally verb-final, but three speaker-provided chad arrangements contradict an obligatory order in this construction. Whether these options differ in topic, focus or emphasis has not yet been established." },
          { type: "examples", label: "The same grammatical elements in three orders ,  structural labels, not English translations", items: [
            { kutchi: "Au(n) chada(n)tho hin ke", english: "Subject → Verb → ke-marked phrase", captionKind: "structure" },
            { kutchi: "Chada(n)tho au(n) hin ke", english: "Verb → Subject → ke-marked phrase", captionKind: "structure" },
            { kutchi: "hin ke au(n) chada(n)tho", english: "ke-marked phrase → Subject → Verb", captionKind: "structure" },
          ] },
          { type: "finding", strength: "attested", label: "A correction to my original description", text: "All three orders were supplied as possible arrangements. This rules out obligatory verb-final order for this construction, but does not establish frequency or equivalent flexibility with other verbs." },
          { type: "text", text: "The recorded data also includes verb-final clauses and an omitted au(n) where the verb form identifies the actor. The next step is to compare the same context with different orders and test how listeners interpret them." },
          { type: "examples", label: "Earlier examples with a final verb", items: [
            { kutchi: "Au(n) khadho kya(n)tho", english: "I am eating food." },
            { kutchi: "Au(n) hane ghare vina(n)tho", english: "I am going home now." },
            { kutchi: "kana(n)tho", english: "I'm taking it.", context: "Speaker explicitly permits the omitted pronoun" },
          ] },
          { type: "questions", items: [
            "Do these three arrangements differ in emphasis, contrast or information that is already known?",
            "Can I begin clauses with other action verbs in the same circumstances?",
            "Is reordering equally natural when there is no ke-marked phrase?",
          ] },
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
          { type: "text", text: "The recorded question forms include kadaa (‘where’) and ku’la (‘why’). These appear before the verb in the supplied clauses. The verb ending also differs in questions addressed to a man or woman. Embedded and longer questions remain to be tested." },
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
          { type: "text", text: "Se (‘because’) connects a reason in the recorded home-going sentence, while pun (‘but’) connects contrasting locations. Alternative clause orders and contexts have not yet been tested." },
        ],
      },
      {
        id: "condition-and-consequence",
        title: "If it rains, then I will stay",
        blocks: [
          { type: "examples", items: [
            { kutchi: "savare varsaath pondhi, tha poi au(n) ghare rondhose", english: "If it rains tomorrow, I will stay home." },
          ] },
          { type: "text", text: "The speaker glossed varsaath as ‘rain’, pondhi as ‘will fall’, tha poi as ‘so then’ and rondhose as ‘I will stay’. The English translation is conditional, but no separate Kutchi word was confirmed as meaning ‘if’ in this example." },
          { type: "finding", strength: "hypothesis", label: "A conditional relation", text: "The preceding rain clause may contribute to the conditional interpretation. Other hypothetical and counterfactual contexts are required to test this analysis." },
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
          { type: "text", text: "Jikee appears in the relative construction ‘the boy who is sleeping’, while ker was supplied for interrogative ‘who?’ and koi be for indefinite ‘whoever’. The English glosses conceal distinct Kutchi expressions." },
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
          { type: "text", text: "Chokro sumetho and Hee chokro sutho ai were both translated as ‘the boy is sleeping’. Equivalent English translations do not establish identical Kutchi meanings; the forms should be compared with the speaker, referent and discourse context held constant." },
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
  ...octoberResearchArticles,
];

/**
 * Only speaker-supplied words and transparent inflected-form -> lookup paths.
 * For forms without a verified lemma, search the exact attested surface spelling.
 */
export const dictionaryLookups: Record<string, string> = {
  "au(n)": "au(n)", "paa(n)": "paa(n)", "thu(n)": "thu(n)",
  "hin": "hin", "hee": "hee", "hoo": "hoo", "mu": "mu", "vathe": "vathe", "chopri": "chopri",
  "hinee": "hinee", "hoonee": "hoonee", "mukhe": "mukhe",
  "miri(n)": "miri(n)", "mere": "mere", "chokro": "chokro",
  "chokra": "chokro", "chokre": "chokro", "chokri": "chokri",
  "chokreu(n)": "chokri", "maru": "maru", "bhairee": "bhairee",
  "ghar": "ghar", "ghare": "ghar", "ghare(n)": "ghar",
  "cheejeu(n)": "cheej", "cheeju(n)": "cheej", "cheej": "cheej",
  "khadho": "khadho", "kadho": "khadho",
  "ke": "ke", "la": "la", "me": "me", "ai": "ai", "i(n)ya": "i(n)ya", "i(n)ye": "i(n)ye",
  "kapetho": "kapetho", "kape(n)thaa": "kapetho", "kape(n)theu(n)": "kapetho",
  "natho": "natho", "nathi": "nathi", "nathaa": "nathaa", "na": "na",
  "nah": "nah", "nai": "nai", "kan": "kan", "kana(n)tho": "kan",
  "kana(n)thi": "kan", "kane(n)tho": "kan", "kane(n)thi": "kan",
  "kanetho": "kan", "kanethi": "kan", "kano(n)thaa": "kan",
  "kane(n)thaa": "kan", "kandhose": "kan", "dhinose": "de",
  "dhine": "de", "sum": "sum", "sumetho": "sum", "sumethi": "sum",
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
  "pe(n)sa": "pe(n)sa", "hikro": "hikro", "kayose": "kan",
  "khade": "khadho", "dhineese": "de", "dhya(n)": "de", "dye": "de",
  "raja": "raja", "bapa": "bapa", "kape(n)": "kapetho",
  "pun": "pun", "se": "se", "savare": "savare", "kaal": "kaal",
  "haroj": "haroj", "hane": "hane", "kadaa": "kadaa",
  "ku’la": "ku’la", "kuroo": "kuroo", "jikee": "jikee",
  "ker": "ker", "jo": "jo", "mujo": "mujo", "hinjo": "hinjo",
  "vado": "vado", "vadi": "vado", "vadaa": "vado",
  "thadho": "thadho", "thadhee": "thadho",
  "bhaa": "bhaa", "acha": "acha", "ache": "ache", "hadaa": "hadaa",
  "hudaa": "hudaa", "chad": "chad", "chada(n)tho": "chad", "de": "de", "kheno": "kheno",
  "suthyaa": "sum", "thake’lo": "thake’lo", "varsaath": "varsaath",
  "pondhi": "pondhi", "rondhose": "rondhose",
};
export function researchArticleBySlug(slug: string) {
  return researchArticles.find((article) => article.slug === slug);
}
