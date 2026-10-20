"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type ApiResult, type HistoryArticle, readPublicApi } from "./content-api";
import { ContentState, LoadingState } from "./content-state";
import { MarkdownContent } from "./markdown";
import { safeExternalUrl } from "@/lib/safe-external-url";

function publishedDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export function HistoryDetail({ slug }: { slug: string }) {
  const [result, setResult] = useState<ApiResult<HistoryArticle> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    readPublicApi<HistoryArticle>(`/api/history/${encodeURIComponent(slug)}`, controller.signal)
      .then((response) => {
        if (
          response.status === "success" &&
          response.data.slug !== slug &&
          /^[a-z0-9]+(-[a-z0-9]+)*$/.test(response.data.slug)
        ) {
          router.replace(`/history/${response.data.slug}`);
          return;
        }
        setResult(response);
      }).catch(() => {});
    return () => controller.abort();
  }, [slug, router]);

  return (
    <div className="page-width interior-page detail-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span>
        <Link href="/history">History &amp; culture</Link>
      </nav>
      {!result ? <LoadingState label="Loading article…" /> : result.status !== "success" ? (
        <ContentState
          title={result.status === "not-found" ? "Article not found" : "Article unavailable"}
          description={result.status === "not-found"
            ? "This story may be unpublished or the address may have changed."
            : "This story could not be loaded right now."}
          action={{ label: "Browse history", href: "/history" }}
        />
      ) : <ArticleContent article={result.data} />}
    </div>
  );
}

function ArticleContent({ article }: { article: HistoryArticle }) {
  const sources = article.sources ?? [];
  return (
    <article className="history-article">
      <header className="history-article__header">
        <p className="eyebrow">History &amp; culture</p>
        <h1>{article.title}</h1>
        {article.summary && <p className="history-article__summary">{article.summary}</p>}
        <div className="article-meta">
          {publishedDate(article.published_at) && <span>Published {publishedDate(article.published_at)}</span>}
          {article.categories?.map((category) => <span key={category.id}>{category.title}</span>)}
        </div>
      </header>
      <div className="reading-column history-article__body">
        {article.body_markdown
          ? <MarkdownContent content={article.body_markdown} />
          : <p>The text of this story is being prepared.</p>}
        {article.media?.length ? (
          <section className="article-media" aria-labelledby="article-media-heading">
            <h2 id="article-media-heading">Images &amp; recordings</h2>
            {article.media.filter((item) => item.url).map((item) => (
              <figure key={item.id}>
                {item.kind === "image" ? (
                  <Image
                    src={item.url!}
                    alt={item.alt_text || item.caption || "Image associated with this article"}
                    width={1200}
                    height={720}
                    unoptimized
                  />
                ) : (
                  <audio controls preload="none" src={item.url!}>Your browser cannot play this recording.</audio>
                )}
                {(item.caption || item.speaker_name || item.attribution) && (
                  <figcaption>
                    {item.caption || (item.kind === "audio" ? "Recording" : "Archive image")}
                    {item.speaker_name && ` · ${item.speaker_name}`}
                    {item.attribution && <small>{item.attribution}</small>}
                  </figcaption>
                )}
              </figure>
            ))}
          </section>
        ) : null}
        {sources.length > 0 && (
          <section className="article-sources" aria-labelledby="article-sources-heading">
            <h2 id="article-sources-heading">Sources</h2>
            <ol>
              {sources.map((source) => {
                const url = source.url ? safeExternalUrl(source.url) : null;
                return (
                  <li key={source.id}>
                    <strong>{source.title}</strong>
                    {source.citation && <cite>{source.citation}</cite>}
                    {url && <a href={url} rel="noopener noreferrer">View source <span aria-hidden="true">↗</span></a>}
                  </li>
                );
              })}
            </ol>
          </section>
        )}
      </div>
      <div className="article-return"><Link className="text-link" href="/history">← Back to history &amp; culture</Link></div>
    </article>
  );
}
