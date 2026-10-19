import { LoadingState } from "@/components/public/content-state";
import { PublicShell } from "@/components/public/shell";

export default function LoadingDictionaryEntry() {
  return <PublicShell><div className="page-width interior-page"><LoadingState label="Loading dictionary entry…" /></div></PublicShell>;
}
