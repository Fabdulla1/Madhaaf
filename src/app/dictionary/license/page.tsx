import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public/shell";
import { dictionaryLicense } from "@/lib/dictionary-license";

export const metadata: Metadata = {
  title: "Dictionary license and citation",
  description: "How to reuse and cite Madhaaf dictionary data under CC BY 4.0.",
  alternates: { canonical: "/dictionary/license" },
};

export default function DictionaryLicensePage() {
  return <PublicShell>
    <div className="page-width interior-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span>
        <Link href="/dictionary">Dictionary</Link><span aria-hidden="true">/</span>
        <span aria-current="page">License and citation</span>
      </nav>
      <article className="page-intro">
        <p className="eyebrow">Dictionary / Reuse</p>
        <h1>License and citation.</h1>
        <p>The original published Madhaaf dictionary entries, selection, arrangement and annotations are available under <a href={dictionaryLicense.url} rel="license">CC BY 4.0</a> to the extent Madhaaf holds the rights to license them.</p>
        <h2>How to credit the dictionary</h2>
        <p>You may share and adapt this data, including commercially. When sharing it, credit <strong>{dictionaryLicense.attribution}</strong>, link to the <Link href="/dictionary">dictionary</Link> and the <a href={dictionaryLicense.url} rel="license">CC BY 4.0 license</a>, and say if you made changes. Do not suggest that Madhaaf endorses your use.</p>
        <h2>Suggested reference</h2>
        <blockquote><p>Madhaaf (Farhan Abdulla). <cite>Madhaaf Dictionary</cite>. <a href={dictionaryLicense.source}>{dictionaryLicense.source}</a>. Accessed [date]. Licensed under CC BY 4.0. [Describe changes, if any].</p></blockquote>
        <p>For a specific word, also link to its individual entry page. Academic work should cite the dictionary as a source; CC BY 4.0 permits attribution in any reasonable manner and does not require a particular citation style.</p>
        <h2>What this covers</h2>
        <p>This license does not automatically cover third-party sources, speaker-supplied examples or translations, recordings, images, video, private records, research articles, or site code. Check their own credits and permissions. Individual words and material outside copyright or database-right protection are not restricted by this notice.</p>
        <p><a href="https://creativecommons.org/licenses/by/4.0/legalcode">Read the full CC BY 4.0 license text</a>.</p>
      </article>
    </div>
  </PublicShell>;
}
