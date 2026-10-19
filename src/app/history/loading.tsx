import { LoadingState } from "@/components/public/content-state";
import { PublicShell } from "@/components/public/shell";

export default function LoadingHistory() {
  return <PublicShell><div className="page-width interior-page"><LoadingState label="Loading the history archive…" /></div></PublicShell>;
}
