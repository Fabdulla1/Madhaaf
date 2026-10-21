import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResearchArticleView } from "@/components/public/language-research";
import { researchArticles, researchArticleBySlug } from "@/lib/language-articles";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return researchArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = researchArticleBySlug(slug);
  if (!article) return { title: "Research article not found" };
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/language/articles/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.summary,
      images: [{ url: article.illustration, width: 1200, height: 700 }],
    },
  };
}

export default async function LanguageArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = researchArticleBySlug(slug);
  if (!article) notFound();
  return <ResearchArticleView article={article} />;
}
