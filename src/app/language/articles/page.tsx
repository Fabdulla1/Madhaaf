import type { Metadata } from "next";
import { ResearchIndex } from "@/components/public/language-research";

export const metadata: Metadata = {
  title: "Language research articles",
  description: "Illustrated, speaker-led research articles on the grammar of East African Mombasa Kutchi, including case marking, possession, and negation.",
  alternates: { canonical: "/language/articles" },
};

export default function LanguageArticlesPage() {
  return <ResearchIndex />;
}
