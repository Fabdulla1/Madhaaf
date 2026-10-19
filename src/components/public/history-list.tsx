"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type ApiResult, type HistoryArticle, readPublicApi } from "./content-api";
import { ContentState, LoadingState } from "./content-state";

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export function HistoryList({ category }: { category?: { slug: string; label: string } }) {
  const [result, setResult] = useState<ApiResult<HistoryArticle[]> | null>(null);
  const categorySlug = category?.slug;

  useEffect(() => {
    const controller = new AbortController();
    const path = categorySlug ? `/api/history?category=${encodeURIComponent(categorySlug)}` : "/api/history";
    readPublicApi<HistoryArticle[]>(path, controller.signal).then(setResult).catch(() => {});
    return () => controller.abort();
  }, [categorySlug]);

  if (!result) return <LoadingState label="Loading published stories…" />;
  if (result.status !== "success") return <ContentState
    title="History archive unavailable"
    description="Published articles could not be loaded. Please try again later."
  />;
  const articles = Array.isArray(result.data) ? result.data : [];
  if (articles.length === 0) return <ContentState
    title={category ? `No published ${category.label.toLowerCase()} stories yet` : "No published stories yet"}
    description="Documented articles will appear here after they are reviewed and approved for publication."
    action={category ? { label: "View all stories", href: "/history" } : undefined}
  />;

  return (
    <section className="article-list" aria-labelledby="published-stories">
      <div className="list-heading"><h2 id="published-stories">{category ? category.label : "Published stories"}</h2><span>{articles.length} {articles.length === 1 ? "article" : "articles"}</span></div>
      <div className="article-list__items">
        {articles.map((article) => (
          <Link className="article-row" href={`/history/${article.slug}`} key={article.id}>
            <span>
              {formatDate(article.published_at) && <small>{formatDate(article.published_at)}</small>}
              <strong>{article.title}</strong>
              {article.summary && <span>{article.summary}</span>}
            </span>
            <span className="article-row__arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
