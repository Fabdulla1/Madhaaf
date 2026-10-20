"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const groups = [
  { api: "members", path: "family-members", title: "Family members", label: "preferred_name" },
  { api: "lexemes", path: "dictionary", title: "Dictionary", label: "headword" },
  { api: "articles", path: "history", title: "History and culture", label: "title" },
] as const;

type Row = { id: string; status: string; [key: string]: unknown };
type EditorialState = "draft" | "review";

async function loadQueue(api: string, status: EditorialState, signal: AbortSignal): Promise<Row[]> {
  const rows: Row[] = [];
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ status, page: String(page), limit: "200" });
    const response = await fetch(`/api/admin/${api}?${params}`, { signal, cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw Error(result.error || `Could not load ${status} ${api}`);
    rows.push(...(result.data || []));
    if (!result.pagination?.hasMore) return rows;
  }
}

export function DraftsPage() {
  const [data, setData] = useState<Record<string, Row[]>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(groups.map(async group => {
      const [drafts, review] = await Promise.all([
        loadQueue(group.api, "draft", controller.signal),
        loadQueue(group.api, "review", controller.signal),
      ]);
      return [group.api, [...drafts, ...review]] as [string, Row[]];
    }))
      .then(entries => { if (!controller.signal.aborted) setData(Object.fromEntries(entries)); })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load drafts"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <>
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a533e]">Editorial queue</p>
    <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Drafts and publishing</h1>
    <p className="mt-3 text-[#4f625f]">Review unpublished work before sharing it. Family material remains in the private space.</p>
    {error && <p role="alert" className="mt-6 text-[#9a2e2e]">{error}</p>}
    <div className="mt-10 grid gap-9 lg:grid-cols-3">
      {groups.map(group => {
        const rows = data[group.api] || [];
        return <section key={group.api}>
          <h2 className="font-serif text-2xl">{group.title}</h2>
          <p className="mt-1 text-sm text-[#4f625f]">{loading ? "Loading queue…" : error ? "Queue unavailable" : `${rows.length} awaiting publication`}</p>
          {!loading && !error && <div className="mt-4 divide-y divide-[#d8d3c8] border-t border-[#d8d3c8]">
            {rows.length ? rows.map(row => <Link href={`/admin/${group.path}/${row.id}`} key={row.id} className="block py-4 font-semibold hover:underline">
              {String(row[group.label])}
              <span className="mt-1 block text-xs font-normal capitalize text-[#4f625f]">{row.status}</span>
            </Link>) : <p className="py-5 text-sm text-[#4f625f]">No drafts waiting.</p>}
          </div>}
        </section>;
      })}
    </div>
  </>;
}
