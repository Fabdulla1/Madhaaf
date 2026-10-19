"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function PublicFamilyEntry() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/family/tree", { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(result => { if (result) setEnabled(Boolean(result.data?.enabled)); })
      .catch(() => {})
    return () => controller.abort();
  }, []);

  return <div className="mt-9 flex flex-wrap items-center gap-4">
    {enabled === true && <Link className="rounded bg-[#163e3a] px-6 py-3 font-semibold text-white" href="/family/tree?view=public">Explore the public family tree</Link>}
    {enabled === false && <p className="max-w-xl text-sm leading-6 text-[#4f625f]">The public tree has not been opened yet. Reviewed family stories will appear here when they are ready.</p>}
    <Link className="rounded border border-[#163e3a] px-6 py-3 font-semibold" href="/login">Administrator sign in</Link>
  </div>;
}
