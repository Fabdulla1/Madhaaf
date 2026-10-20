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

// Suggestions only: no place is selected automatically or assigned to a person.
export const birthplaceOptions = [
  "Mombasa", "Nairobi", "Lamu", "Zanzibar", "Dar es Salaam", "Kutch",
] as const;
