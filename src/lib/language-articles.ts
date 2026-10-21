/**
 * Public editorial research based on speaker-supplied East African Kutchi examples.
 * Keep attested strings intact. Interpretations and grammaticality judgments must
 * remain visibly separate from hypotheses; never synthesize new Kutchi sentences.
 */
export type ResearchExample = {
  kutchi: string;
  english: string;
  context?: string;
  /** Indicates a word-order annotation rather than a speaker-provided English translation. */
  captionKind?: "structure";
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
    slug: "what-ke-marks",
    editorialDate: "2026-03-12",
    number: "01",
    subject: "Case and argument structure",
    title: "What does ke mark? Following a particle through Kutchi sentences",
    summary: "I started with a question I could not answer simply: why do I say ke after some words but not others? These contrasts are my first attempt to work it out.",
    introduction: "I grew up using ke without having to stop and explain it. Once I started writing down Kutchi sentences for Madhaaf, that little word became one of the hardest things to describe. Sometimes it follows the thing I am doing something to. Sometimes it comes after the person receiving something, or the person who wants it. And sometimes, removing it means I have to change another word as well. I wanted to put those observations side by side instead of pretending they amount to one finished rule.",
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
          { type: "text", text: "I began with two sentences that I would both translate as ‘I am seeing this boy.’ They helped me notice that the difference is not just whether ke is present. The word for ‘this’ changes too. That is why I want to keep both complete sentences in the record." },
          { type: "examples", label: "Two acceptable constructions", items: [
            { kutchi: "Au(n) hin chokro ke disa(n)tho", english: "I am seeing this boy.", context: "With hin … ke" },
            { kutchi: "Au(n) hee chokro disa(n)tho", english: "I am seeing this boy.", context: "With hee and without ke" },
          ] },
          { type: "finding", strength: "attested", label: "Speaker judgment", text: "When I remove ke in this example, I also have to change hin to hee. That is my grammaticality judgment. I suspect the two forms belong to different grammatical environments, perhaps something like direct and oblique forms, but I cannot confirm that from this contrast alone." },
          { type: "text", text: "I want a future Madhaaf translator to learn this exact lesson: words cannot always be translated or deleted one at a time. It will need to recognize a whole construction and the changes that go with it." },
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
          { type: "text", text: "I also tried other verbs. When I talk about throwing food or water, I can leave ke out. When I talk about taking water, leaving it out changes the sense for me—closer to taking something like medicine. I am recording those differences as judgments about these specific sentences, not as a rule for every use of ke." },
          { type: "finding", strength: "unresolved", label: "An open distribution", text: "I have not yet isolated the cause of the alternation. It may involve the verb, the noun's specificity, the demonstrative, or the meaning I intend. I need more controlled pairs before I can say whether this is general object marking or a property of certain constructions." },
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
          { type: "text", text: "In my example about giving water to a boy, the boy receives the water. In my example about wanting water, the person experiences the wanting. Both can appear with ke, although they are different grammatical relationships. That is why I currently describe ke as case-like, with possible object, recipient and experiencer uses." },
          { type: "text", text: "The similarity between hin ke and mukhe caught my attention as well. I know I use mukhe when I say ‘I want water’ or ‘the boy gave me water.’ I am not yet ready to claim where one part of that word ends and another begins." },
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
          { type: "text", text: "I can say both chokre ke kapetho and chokro ke kapetho for ‘the boy wants it.’ Neither needs to be corrected into the other on the evidence I have. I want to find out whether families, contexts or emphasis explain the variation." },
          { type: "finding", strength: "hypothesis", label: "A possible second ke", text: "Another sentence complicates the picture: Mukhe kapetho ke hee chokri hadaa ache, ‘I want this girl to come here.’ Here I may be using ke to connect the wanting to an entire event. That looks different from ke after a boy who receives water, so I am keeping the proposed clause-linking use separate." },
        ],
      },
      {
        id: "order-with-ke",
        title: "A ke-marked phrase can appear in more than one position",
        blocks: [
          { type: "text", text: "Another correction emerged when I moved the parts of a sentence with chad (‘let go / leave alone’) around. I can put the subject first, the verb first, or the ke-marked phrase first. These are three arrangements I supplied for the same intended construction. I have not yet tested whether a different position changes the emphasis or topic. The labels below describe word order only; they are not separate English translations." },
          { type: "examples", label: "Three accepted arrangements — constituent-order labels, not translations", items: [
            { kutchi: "Au(n) chada(n)tho hin ke", english: "Subject → Verb → ke-marked phrase", captionKind: "structure" },
            { kutchi: "Chada(n)tho au(n) hin ke", english: "Verb → Subject → ke-marked phrase", captionKind: "structure" },
            { kutchi: "hin ke au(n) chada(n)tho", english: "ke-marked phrase → Subject → Verb", captionKind: "structure" },
          ] },
          { type: "finding", strength: "attested", label: "A word-order correction", text: "I previously described Kutchi as tending to put verbs last. This was too broad. In my chad examples the verb occurs at the start, in the middle and at the end. This establishes flexibility in this construction, but not that every possible order works with every verb." },
        ],
      },
      {
        id: "research-agenda",
        title: "What the evidence permits—and what it doesn't",
        blocks: [
          { type: "text", text: "What I can publish confidently today is the set of forms and the contrasts I have tested. I cannot yet publish a single universal definition of ke. I would rather leave that question open than teach a tidy rule that my own speech contradicts." },
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
    summary: "I compared eight verbs I use in ordinary speech and began to see recurring patterns for person, gender and number—along with some surprises in past forms and negation.",
    introduction: "The first time I laid out the forms of kar (‘do’) and kan (‘take’) in a table, I could see how much grammar I had always been using without naming it. I say different forms depending on whether I am speaking as a man or a woman, addressing someone, or talking about a group. I then tried the same exercise with six more verbs. What follows is my notebook of those comparisons, including the places where I am still unsure how to divide a verb into smaller parts.",
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
          { type: "text", text: "I find kan (‘take’) particularly useful because I can compare the same action across speakers and subjects. I recorded masculine and feminine singular forms, changes with first, second and third person, and plural forms. When I repeat the exercise with other verbs, I hear a similar pattern, even where the stem itself shifts." },
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
          { type: "text", text: "When I compare kara(n)tho with kana(n)tho, or suma(n)thi with kana(n)thi, the resemblance is hard to miss. I take that as good evidence that the forms show agreement. I have not yet established which pieces are independent grammatical endings, so I am keeping the full words in the table." },
          { type: "finding", strength: "attested", label: "Orthographic convention", text: "I use (n) when a written n comes immediately before th in these documented forms—for example kara(n)tho, kane(n)thi and sume(n)thaa. This is part of the working spelling system I am developing for Madhaaf, not a claim that the sound must always be optional." },
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
          { type: "text", text: "One surprise was that I could use the same present form for an action happening now and a regular habit. Haroj means ‘every day’ in my examples, and adding it can change how the sentence is understood without changing the verb. So I no longer want to label these endings ‘progressive only.’" },
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
          { type: "text", text: "Some past forms deserve their own chapter. For vin (‘go’) I supplied vina(n)tho in the present and oosyose for a masculine first-person past. For sum (‘sleep’), suma(n)tho contrasts with suthose. I cannot generate a trustworthy past form just by adding one suffix; I need to study these stem changes and past agreement separately." },
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
          { type: "text", text: "Many of my first-person future examples share -dhose, but my translation of ‘she will go home tomorrow’ contains vendhee. I therefore cannot assume the first-person future form works for every subject. The negative sentences add another layer: natho and nathi contrast in the sleeping examples, na appears in a past clause, and nah is used in commands." },
          { type: "finding", strength: "hypothesis", label: "Where agreement lives", text: "I noticed that the main verb stays sume in both Natho sume and Nathi sume. Perhaps part of the grammatical agreement has shifted onto a negative auxiliary. That is an idea worth testing with more verbs and plural subjects, not yet a rule I am prepared to teach." },
        ],
      },
      {
        id: "next-tests",
        title: "Before building a general conjugation engine",
        blocks: [
          { type: "text", text: "For me, these tables are a starting point for preserving speech, not a machine that can produce every Kutchi verb. I want to repeat the comparisons, check them with other speakers, and keep the unusual forms visible instead of forcing them to fit the neatest pattern." },
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
    summary: "I looked closely at how we say boys, girls, houses and things, and found that plurals and describing words are not as uniform as a simple chart might suggest.",
    introduction: "I thought plural nouns might be one of the easier parts of this project. Chokro becomes chokra, which is simple enough to put in a table. Then I tried other nouns. I heard chokri alongside chokreu(n), while ghar stayed ghar in one sentence but appeared as ghare(n) in another. The words for ‘big’, ‘this’ and ‘those’ changed around them too. This article is my attempt to keep those differences together, without inventing a single plural rule for the whole language.",
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
          { type: "text", text: "In the examples I gave, chokro pairs with chokra and chokri with chokreu(n). The verb also changes: the sentences about one boy or girl use different singular forms, while the sentences about groups share sume(n)thaa. I see a pattern, but I want to test many more nouns before calling it a complete declension." },
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
          { type: "text", text: "I also said Hinee ghare(n) me for ‘in these houses,’ but Hinee ghar vadaa i(n)ye for ‘these houses are big.’ I cannot honestly describe ghare(n) as just ‘the plural’ when ghar appears in another plural sentence. Something about the surrounding construction seems to matter." },
          { type: "finding", strength: "hypothesis", label: "Number versus case", text: "My current guess is that -e(n) can appear in a form used before me (‘in’), perhaps an oblique or case-conditioned form. I still need the same noun tested in subject, object and location phrases before I can settle that explanation." },
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
          { type: "text", text: "I can hear a difference between vado with a man, vadi with a woman, and vadaa with several houses. I gave a similar contrast for ‘cold’: thadho and thadhee. Those sentences support agreement in these descriptions, but they do not prove that every adjective will behave exactly the same way." },
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
          { type: "text", text: "With boys running, hee and hoo distinguish ‘this’ from ‘that’, and hinee and hoonee distinguish ‘these’ from ‘those’. But another pair of sentences about seeing a boy contrasts hin … ke with hee without ke. I suspect the reference system also interacts with grammatical function, not just distance." },
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
          { type: "text", text: "When I say ‘my house,’ I use mujo ghar. When I say ‘my brother’s house,’ I use mujo bhaa jo ghar. I also use hinjo ghar for ‘his house.’ I want to see whether jo changes with feminine or plural things being owned before I write a general rule." },
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
    summary: "I noticed that wanting water, wanting several things and wanting to do something do not share one simple Kutchi sentence pattern.",
    introduction: "The English word ‘want’ hid an important part of my Kutchi grammar from me. I can say that I want water, that someone else wants water, or that I want to go—but I do not build all three sentences the same way. The form mukhe keeps turning up when I am the person who wants something. I also found that kapetho does not always change when the person wanting changes, yet a plural desired item can change the predicate. These are the contrasts I am trying to understand.",
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
          { type: "text", text: "When I say Mukhe paani kapetho, I do not use au(n), the subject pronoun in many of my action sentences. When I say Hin ke paani kapetho, I am talking about another person wanting the same water, and kapetho stays the same. That makes me wonder whether the person wanting something is expressed in a dative-like form." },
          { type: "finding", strength: "hypothesis", label: "An agreement puzzle", text: "I suspect the desired item may help determine the verb form. That would be different from the familiar pattern where an action verb agrees with the person performing it. But a change in agreement does not settle which phrase counts as the subject, so I am keeping that question open." },
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
          { type: "text", text: "With multiple things, I supplied both kape(n)thaa and kape(n)theu(n) in different sentences. I specifically connected the plural form to cheejeu(n). I do not yet know why two different plural-looking forms occur, and I would rather preserve both than declare one the correct form." },
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
          { type: "text", text: "When I want to perform an action, I use phrases such as sumno ai, veno ai and fagayno ai. I have also supplied cha(n)dno ai for wanting to spray something. The ending resembles -no, but I am not ready to say I can attach -no to any verb without checking it with a speaker." },
        ],
      },
      {
        id: "another-person",
        title: "Wanting another person to act",
        blocks: [
          { type: "examples", items: [
            { kutchi: "Mukhe kapetho ke hee chokri hadaa ache", english: "I want this girl to come here." },
          ] },
          { type: "text", text: "Wanting another person to do something produces another kind of sentence in my notes: Mukhe kapetho ke hee chokri hadaa ache. It has one person who wants an event and another who would perform it. I am treating the ke before the second clause as a possible clause-linking use until I collect more examples." },
          { type: "finding", strength: "unresolved", label: "Two constructions, not one formula", text: "These two patterns—wanting to go myself and wanting a girl to come—may involve different non-finite or subordinate structures. I can hear the difference in the examples, but explaining every piece of the grammar will take more work." },
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
          { type: "text", text: "I also want to understand why my negative sentences put paani first in paani mukhe natho kape and paani hin ke natho kape, while an affirmative example is Mukhe paani kapetho. In a plural negative, nathaa appears with kape(n). I am recording the word orders and forms without assuming that negation always forces one order." },
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
    summary: "I am documenting how I reorder sentence elements, ask questions, give reasons and link ideas in Kutchi—without assuming verbs always come last.",
    introduction: "A dictionary matters, but it does not capture everything I mean when I speak. One lesson came when I tried moving the parts of a sentence with chad (‘let go’) around: the verb could begin, appear between other elements, or come last. I can also ask where someone is going, explain that I am tired, or describe the boy who is sleeping. I am collecting these examples to understand word order and how I connect ideas, rather than assuming a single structure for every sentence.",
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
          { type: "text", text: "I used to write that Kutchi verbs tend to come last. That goes further than the evidence I have. When I tested chad with au(n) (‘I’) and hin ke (a ke-marked phrase), I supplied three arrangements. The verb appears between the other elements, at the beginning, or at the end. I have not yet established whether these alternatives differ in topic, focus, or emphasis." },
          { type: "examples", label: "The same grammatical elements in three orders — structural labels, not English translations", items: [
            { kutchi: "Au(n) chada(n)tho hin ke", english: "Subject → Verb → ke-marked phrase", captionKind: "structure" },
            { kutchi: "Chada(n)tho au(n) hin ke", english: "Verb → Subject → ke-marked phrase", captionKind: "structure" },
            { kutchi: "hin ke au(n) chada(n)tho", english: "ke-marked phrase → Subject → Verb", captionKind: "structure" },
          ] },
          { type: "finding", strength: "attested", label: "A correction to my original description", text: "All three orders were supplied as possible word-order arrangements. This rules out treating the verb-final position as obligatory for this construction. I still have no representative counts to show that it is the most common order, or evidence that all verbs permit the same permutations." },
          { type: "text", text: "I do still use verb-final sentences, including those below. I can also leave au(n) out when a form like kana(n)tho identifies the actor in context. The next step is to compare identical situations and ask how moving words changes what listeners pay attention to." },
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
          { type: "text", text: "I have recorded kadaa for ‘where’ and ku’la for ‘why’, and the question words appear before the verbs in the examples here. In my questions about doing something, the ending also changes depending on whether I address a man or a woman. I still need to test questions inside longer sentences." },
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
          { type: "text", text: "When I explain why I am going home, I use se for ‘because’. When I contrast where two people are, I use pun for ‘but’. I recognize these naturally, but I have not yet tried reversing the clauses or changing the sentence context to see which orders are possible." },
        ],
      },
      {
        id: "condition-and-consequence",
        title: "If it rains, then I will stay",
        blocks: [
          { type: "examples", items: [
            { kutchi: "savare varsaath pondhi, tha poi au(n) ghare rondhose", english: "If it rains tomorrow, I will stay home." },
          ] },
          { type: "text", text: "In the sentence about rain tomorrow, I explained varsaath as ‘rain’, pondhi as ‘will fall’, tha poi as ‘so then’, and rondhose as ‘I will stay’. My English translation begins with ‘if’, but I did not provide a separate word that I can safely label ‘if’ in the Kutchi example." },
          { type: "finding", strength: "hypothesis", label: "A conditional relation", text: "I suspect that placing the rain clause before its consequence may be enough to convey the conditional meaning here. I would need other hypothetical situations, including situations that did not happen, to understand this construction." },
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
          { type: "text", text: "I distinguish jikee in a phrase such as ‘the boy who is sleeping’ from ker, the word I gave for asking ‘who?’ I also supplied koi be when the intended meaning was ‘whoever’. Writing down that difference reminds me how easily English can hide several Kutchi constructions under one word." },
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
          { type: "text", text: "I have recorded both Chokro sumetho and Hee chokro sutho ai for English ‘the boy is sleeping’. I do not want to assume those are identical in meaning just because I translated them with similar English. The next useful step is to hold the speaker, subject and situation constant and compare them directly." },
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
  "hin": "hin", "hee": "hee", "hoo": "hoo",
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
  "hudaa": "hudaa", "chad": "chad", "chada(n)tho": "chad", "de": "de", "kheno": "kheno",
  "suthyaa": "sum", "thake’lo": "thake’lo", "varsaath": "varsaath",
  "pondhi": "pondhi", "rondhose": "rondhose",
};
export function researchArticleBySlug(slug: string) {
  return researchArticles.find((article) => article.slug === slug);
}
