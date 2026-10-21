import type { Metadata } from "next";
import Link from "next/link";
import { OrthographyContent } from "@/components/public/orthography-content";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "Writing guide",
  description: "Provisional Latin orthography used to document Mombasa and Ethiopian Kutchi, Draft 0.3.",
};

export default function OrthographyPage() {
  return (
    <PublicShell>
      <div className="page-width interior-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/language">Language</Link>
        </nav>
        <div className="page-intro">
          <p className="eyebrow">Language / Writing</p>
          <h1>Working Latin orthography for East African Kutchi.</h1>
          <p>
            This guide sets out provisional spelling conventions used in
            Madhaaf&apos;s documentation of Mombasa and Ethiopian Kutchi.
            Roman Urdu is one point of comparison, but recorded Kutchi
            pronunciation and usage determine the research conventions.
          </p>
        </div>
        <p className="language-guide-byline">Prepared by <Link href="/about">Farhan Abdulla</Link> · Working orthography</p>
        <OrthographyContent />
      </div>
    </PublicShell>
  );
}
