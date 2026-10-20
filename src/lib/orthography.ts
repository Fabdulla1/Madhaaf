// Project-supplied writing reference shared by the public guide and editors.
// These are working conventions, not input restrictions or normalization rules.
export const letterReference = [
  { letters: "a, e, i, o, u", use: "Basic vowels" },
  { letters: "aa (ā), ee (ē), oo (ō)", use: "Long vowels" },
  { letters: "b, p, t, d, k, g", use: "Common consonants" },
  { letters: "ch, j", use: "As in Roman Urdu chai and jaan" },
  { letters: "kh, gh", use: "Aspirated or other distinct sounds, depending on pronunciation" },
  { letters: "ph, bh, th, dh", use: "Aspirated consonants" },
  { letters: "sh, zh", use: "Additional consonant sounds, if present" },
  { letters: "r, l, m, n, w, y", use: "Common consonants" },
  { letters: "q, f, z, h, s", use: "Other sounds or loanwords" },
  { letters: "(n)", use: "Nasalized n" },
  { letters: "‘l", use: "Glottal L" },
] as const;
