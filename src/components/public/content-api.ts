export type PublicMedia = {
  id: string;
  kind: "image" | "audio";
  alt_text?: string | null;
  caption?: string | null;
  speaker_name?: string | null;
  attribution?: string | null;
  url?: string | null;
};

export type DictionaryEntry = {
  id: string;
  headword: string;
  part_of_speech?: string | null;
  usage_note?: string | null;
  etymology_note?: string | null;
  word_forms?: Array<{ id: string; spelling: string; is_preferred: boolean; note?: string | null }>;
  senses?: Array<{
    id: string;
    gloss_en: string;
    definition_en?: string | null;
    examples?: Array<{
      id: string;
      kutchi_text: string;
      english_translation?: string | null;
      note?: string | null;
    }>;
  }>;
  media?: PublicMedia[];
  orthography_version?: { label: string } | null;
};

export type HistoryArticle = {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  body_markdown?: string | null;
  published_at?: string | null;
  categories?: Array<{ id: string; title: string; slug: string }>;
  sources?: Array<{ id: string; title: string; citation?: string | null; url?: string | null }>;
  media?: PublicMedia[];
};

export type OrthographyVersion = {
  id: string;
  label: string;
  title: string;
  body_markdown: string;
};

export type ApiResult<T> =
  | { status: "success"; data: T; pagination?: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    } }
  | { status: "unavailable" | "not-found" | "error" };

export async function readPublicApi<T>(
  path: string,
  signal?: AbortSignal,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (response.status === 404) return { status: "not-found" };
    if (response.status === 503) return { status: "unavailable" };
    if (!response.ok) return { status: "error" };
    const payload: unknown = await response.json();
    if (
      !payload ||
      typeof payload !== "object" ||
      !("data" in payload)
    ) {
      return { status: "error" };
    }
    const envelope = payload as { data: T; pagination?: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    } };
    return { status: "success", data: envelope.data, pagination: envelope.pagination };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return { status: "unavailable" };
  }
}
