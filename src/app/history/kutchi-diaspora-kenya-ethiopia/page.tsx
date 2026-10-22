import type { Metadata } from "next";
import { DiasporaHistoryArticle } from "@/components/public/history-diaspora";
import { PublicShell } from "@/components/public/shell";
import { diasporaStudy } from "@/lib/history-diaspora";

export const metadata: Metadata = {
  title: diasporaStudy.title,
  description: diasporaStudy.summary,
  authors: [{ name: diasporaStudy.author, url: "https://madhaaf.vercel.app/about" }],
  alternates: { canonical: `https://madhaaf.vercel.app/history/${diasporaStudy.slug}` },
  openGraph: {
    type: "article", title: diasporaStudy.title, description: diasporaStudy.summary,
    url: `https://madhaaf.vercel.app/history/${diasporaStudy.slug}`,
    authors: [diasporaStudy.author], publishedTime: diasporaStudy.published,
    images: [{ url: "https://madhaaf.vercel.app/history/diaspora/mandvi-shipbuilding.jpg", width: 800, height: 500, alt: "Shipbuilding at Mandvi, Kutch; modern photograph" }],
  },
};

export default function KutchiDiasporaPage() {
  return <PublicShell><DiasporaHistoryArticle /></PublicShell>;
}
