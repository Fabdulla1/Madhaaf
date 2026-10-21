/**
 * Speaker-provided Kutchi examples from the Mombasa dialect elicitation.
 * These forms are descriptive evidence, not a standardized grammar or verified
 * dictionary publication. Do not extrapolate unattested cells.
 */

export const progressiveForms = [
  { subject: "I (masculine)", pronoun: "au(n)", doForm: "karantho", eatForm: "kyantho" },
  { subject: "I (feminine)", pronoun: "au(n)", doForm: null, eatForm: "kyanthi", note: "Feminine eating form reported without a full sentence." },
  { subject: "You (masculine)", pronoun: "thu(n)", doForm: "karentho", eatForm: "kyentho" },
  { subject: "You (feminine)", pronoun: "thu(n)", doForm: "karenthi", eatForm: "kyenthi" },
  { subject: "He", pronoun: "hee", doForm: "karetho", eatForm: "kyetho" },
  { subject: "She", pronoun: "hee", doForm: "karethi", eatForm: "kyethi" },
  { subject: "We", pronoun: "pa(n) / paa(n)", doForm: "karonthaa", eatForm: "kyonthaa" },
  { subject: "They", pronoun: "hinee", doForm: "karenthaa", eatForm: "kyenthaa" },
  { subject: "Everyone", pronoun: "mere", doForm: "karenthaa", eatForm: "kyenthaa" },
] as const;

export const copulaExamples = [
  { kutchi: "Au(n) hadaa i(n)ya", english: "I am here", observation: "First-person subject" },
  { kutchi: "Mere hadaa i(n)ye", english: "Everyone is here", observation: "Collective subject" },
  { kutchi: "Paani sare’lo ai", english: "The water is rotten", observation: "Third-person description" },
  { kutchi: "Mujo maru sare’lo ai", english: "My man is rotten", observation: "Possessive noun phrase" },
  { kutchi: "Ai(n) kee(n) i(n)yo?", english: "How are you?", observation: "Formal / plural address" },
] as const;

export const imperativeExamples = [
  { kutchi: "Jaldi kar", english: "Do it quickly!" },
  { kutchi: "Sanas kar", english: "Defecate!" },
  { kutchi: "Hadaa kar", english: "Do it here!" },
  { kutchi: "Hoodaa kar", english: "Do it there!" },
  { kutchi: "Khaa", english: "Eat!" },
] as const;

export const questionExamples = [
  { kutchi: "Kuroo karentho?", english: "What are you doing? (addressing a man)" },
  { kutchi: "Kuroo karenthi?", english: "What are you doing? (addressing a woman)" },
  { kutchi: "Mere kuroo kyenthaa?", english: "What is everyone eating?" },
  { kutchi: "Ai(n) kee(n) i(n)yo?", english: "How are you? (formal or plural)" },
] as const;
