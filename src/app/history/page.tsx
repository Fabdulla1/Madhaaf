import type { Metadata } from "next";
import Link from "next/link";
import { HistoryList } from "@/components/public/history-list";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "History & culture",
  description: "Published articles and oral histories in the Madhaaf archive.",
};
export const instant = false;

const topics = [
  { slug: "diaspora", label: "Diaspora" },
  { slug: "mombasa-community", label: "Mombasa community" },
  { slug: "language-oral-traditions", label: "Language & oral traditions" },
  { slug: "food-cultural-practices", label: "Food & cultural practices" },
  { slug: "family-stories", label: "Family stories" },
];

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const value = (await searchParams).category;
  const requested = Array.isArray(value) ? value[0] : value;
  const category = topics.find((topic) => topic.slug === requested);
  return (
    <PublicShell>
      <div className="page-width interior-page">
        <div className="page-intro">
          <p className="eyebrow">The archive / History &amp; culture</p>
          <h1>Stories, carefully told.</h1>
          <p>
            This collection will grow with documented articles, oral histories,
            images, and recordings. Material appears publicly after editorial
            review and the appropriate permission to share.
          </p>
        </div>
        <div className="history-topics">
          <p className="eyebrow">Areas of the archive</p>
          <div>
            <Link href="/history" className={!category ? "is-active" : undefined}>All stories</Link>
            {topics.map((topic) => (
              <Link
                href={`/history?category=${topic.slug}`}
                className={category?.slug === topic.slug ? "is-active" : undefined}
                key={topic.slug}
              >
                {topic.label}
              </Link>
            ))}
          </div>
        </div>
        <HistoryList key={category?.slug ?? "all"} category={category} />
      </div>
    </PublicShell>
  );
}
