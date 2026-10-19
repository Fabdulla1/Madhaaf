"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  type ApiResult,
  type DictionaryEntry,
  type HistoryArticle,
  readPublicApi,
} from "./content-api";
import { ContentState, LoadingState } from "./content-state";

export function HomePreviews({ kind }: { kind: "dictionary" | "history" }) {
  const [result, setResult] = useState<ApiResult<DictionaryEntry[] | HistoryArticle[]> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const path = kind === "dictionary" ? "/api/dictionary" : "/api/history";
    readPublicApi<DictionaryEntry[] | HistoryArticle[]>(path, controller.signal)
      .then(setResult)
      .catch(() => {});
    return () => controller.abort();
  }, [kind]);

  if (!result) return <LoadingState label={kind === "dictionary" ? "Loading dictionary entries…" : "Loading stories…"} />;
  if (result.status !== "success") {
    return <ContentState
      title={kind === "dictionary" ? "Dictionary entries are unavailable" : "Stories are unavailable"}
      description={kind === "dictionary"
        ? "The word list could not be loaded. The writing guide remains available."
        : "Published articles could not be loaded. Please return later."}
      action={kind === "dictionary" ? { label: "Read the writing guide", href: "/orthography" } : undefined}
    />;
  }
  const items = Array.isArray(result.data) ? result.data.slice(0, 3) : [];
  if (items.length === 0) {
    return <ContentState
      title={kind === "dictionary" ? "No published words yet" : "No published stories yet"}
      description={kind === "dictionary"
        ? "The first reviewed dictionary entries will appear here."
        : "Reviewed articles will appear here as the archive grows."}
    />;
  }
  if (kind === "dictionary") {
    return (
      <div className="preview-grid">
        {(items as DictionaryEntry[]).map((entry) => (
          <Link href={`/dictionary/${entry.id}`} className="preview-card preview-card--word" key={entry.id}>
            <span className="preview-card__label">Dictionary entry</span>
            <strong>{entry.headword}</strong>
            <span>{entry.senses?.[0]?.gloss_en ?? "View entry"}</span>
            <span className="preview-card__arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    );
  }
  return (
    <div className="preview-grid">
      {(items as HistoryArticle[]).map((article) => (
        <Link href={`/history/${article.slug}`} className="preview-card" key={article.id}>
          <span className="preview-card__label">History &amp; culture</span>
          <strong>{article.title}</strong>
          {article.summary && <span>{article.summary}</span>}
          <span className="preview-card__arrow" aria-hidden="true">↗</span>
        </Link>
      ))}
    </div>
  );
}
