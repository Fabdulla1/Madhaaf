export type LocationKind = "country" | "state" | "city";
export type LocationOption = { id: string; label: string; kind: LocationKind | "saved" };
export type LocationResults = { data: LocationOption[]; hasMore: boolean };

export function normalizePlace(value: string) {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("en").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
