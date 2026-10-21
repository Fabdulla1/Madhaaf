import type { Metadata } from "next";
import { ResearchIndex } from "@/components/public/language-research";

export const metadata: Metadata = {
  title: "Language research articles",
  description: "Five illustrated, evidence-led research articles on Mombasa East African Kutchi grammar.",
  alternates: { canonical: "/language/articles" },
};

export default function LanguageArticlesPage() {
  return <ResearchIndex />;
}
