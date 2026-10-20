export const partOfSpeechOptions = [
  "noun", "proper noun", "verb", "auxiliary verb", "adjective", "adverb",
  "pronoun", "determiner", "numeral", "postposition", "preposition",
  "conjunction", "interjection", "particle", "phrase", "other",
] as const;

export const linguisticTagOptions = [
  ...partOfSpeechOptions,
  "singular", "plural", "masculine", "feminine", "neuter",
  "transitive", "intransitive", "imperative", "past", "present", "future",
  "borrowed", "coastal", "formal", "informal", "archaic", "honorific",
] as const;
