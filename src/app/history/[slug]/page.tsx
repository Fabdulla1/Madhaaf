import type { Metadata } from "next";
import { HistoryDetail } from "@/components/public/history-detail";
import { PublicShell } from "@/components/public/shell";

export const metadata: Metadata = { title: "History article" };
export const instant = false;

export default async function HistoryArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicShell><HistoryDetail slug={slug} /></PublicShell>;
}
