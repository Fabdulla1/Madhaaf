import type { Metadata } from "next";
import Link from "next/link";
import { OrthographyContent } from "@/components/public/orthography-content";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "Writing guide",
  description: "The developing Mombasa Kutchi Latin Orthography, Draft 0.3.",
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
          <h1>How we write Kutchi.</h1>
          <p>
            This is a working Latin orthography. It takes some initial
            influence from Roman Urdu while keeping Mombasa Kutchi forms
            visible on their own terms.
          </p>
        </div>
        <OrthographyContent />
      </div>
    </PublicShell>
  );
}
