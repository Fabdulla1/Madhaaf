export type DuplicateEntity = "dictionary" | "people";
export type DuplicateMatch = {
  id: string; label: string; matchedText: string; exact: boolean; status: string;
  summary: string; details: { label: string; value: string }[];
};
export type DuplicateReview = { entity: DuplicateEntity; query: string; exactIds: string[]; matches: DuplicateMatch[]; hasMore: boolean };
export type DuplicateConfirmation = { entity: DuplicateEntity; query: string; matched_ids: string[] };

export function normalizeDuplicateText(value: string, entity: DuplicateEntity) {
  const normalized = value.trim().normalize("NFC").toLocaleLowerCase("en");
  // Written Kutchi punctuation/marks remain meaningful. Person-name spacing
  // is folded, but a name match never establishes that two people are identical.
  return entity === "people" ? normalized.replace(/\s+/g, " ") : normalized;
}

function editDistance(a: string, b: string, limit: number) {
  const left = Array.from(a), right = Array.from(b);
  if (Math.abs(left.length - right.length) > limit) return limit + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, i) => i);
  let beforePrevious = previous;
  for (let i = 1; i <= left.length; i++) {
    const row = [i];
    for (let j = 1; j <= right.length; j++) {
      row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && left[i - 1] === right[j - 2] && left[i - 2] === right[j - 1]) row[j] = Math.min(row[j], beforePrevious[j - 2] + 1);
    }
    if (Math.min(...row) > limit) return limit + 1;
    beforePrevious = previous; previous = row;
  }
  return previous[right.length];
}

/** Zero means exact; positive scores are suggestions, never automatic merges. */
export function duplicateScore(query: string, candidate: string, entity: DuplicateEntity, exactOnly = false): number | null {
  const a = normalizeDuplicateText(query, entity), b = normalizeDuplicateText(candidate, entity);
  if (!a || !b) return null;
  if (a === b) return 0;
  if (exactOnly || a.length < 2) return null;
  const limit = a.length < 6 ? 1 : 2;
  const distance = editDistance(a, b, limit);
  if (distance <= limit) return distance;
  if (a.length >= 2 && b.startsWith(a) && (entity === "people" || b.length - a.length <= 4)) return 3;
  if (entity === "people") {
    const tokens = a.split(" ");
    if (a.length >= 3 && tokens.every(token => b.split(" ").some(name => name.startsWith(token)))) return 4;
  }
  return null;
}

export function confirmsDuplicates(review: Pick<DuplicateReview, "entity" | "query" | "exactIds">, confirmation?: DuplicateConfirmation) {
  if (!confirmation || confirmation.entity !== review.entity || normalizeDuplicateText(confirmation.query, review.entity) !== normalizeDuplicateText(review.query, review.entity)) return false;
  const ids = new Set(confirmation.matched_ids);
  return review.exactIds.every(id => ids.has(id));
}
