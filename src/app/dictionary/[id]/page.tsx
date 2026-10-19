import type { Metadata } from "next";
import { DictionaryDetail } from "@/components/public/dictionary-detail";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = {
  title: "Dictionary entry",
};
export const instant = false;

export default async function DictionaryEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicShell><DictionaryDetail key={id} id={id} /></PublicShell>;
}
