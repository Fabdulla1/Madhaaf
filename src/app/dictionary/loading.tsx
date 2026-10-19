import { LoadingState } from "@/components/public/content-state";
import { PublicShell } from "@/components/public/shell";

export default function LoadingDictionary() {
  return <PublicShell><div className="page-width interior-page"><LoadingState label="Loading the dictionary…" /></div></PublicShell>;
}
