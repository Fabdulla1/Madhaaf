"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function PublicFamilySettings() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/tree/publication", { signal: controller.signal })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw Error(result.error || "Could not load family tree settings");
        return result.data as { enabled: boolean };
      })
      .then(data => setEnabled(data.enabled))
      .catch(cause => { if (cause.name !== "AbortError") setError(cause.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function update(next: boolean) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/tree/publication", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not update family tree visibility");
      setEnabled(result.data.enabled);
      setMessage(result.data.enabled ? "Public family tree enabled." : "Public family tree disabled.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update family tree visibility");
    } finally {
      setBusy(false);
    }
  }

  return <section className="border border-[#d8d3c8] bg-[#fffcf6] p-6">
    <h2 className="font-serif text-2xl">Public family tree</h2>
    <p className="mt-3 text-sm leading-6 text-[#4f625f]">Choose when visitors can see a reviewed part of the tree. Only people marked <strong>Published</strong>, <strong>Public</strong>, and <strong>Deceased</strong> appear. A connection appears only when both people qualify and the connection is published. Private notes and media stay hidden.</p>
    {loading ? <p className="mt-5 text-sm">Loading setting…</p> : <div className="mt-5 flex flex-wrap items-center gap-4">
      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${enabled ? "bg-[#e1eee5] text-[#235d42]" : "bg-[#eee8dd] text-[#5b6258]"}`}>{enabled ? "Public view on" : "Public view off"}</span>
      <button type="button" disabled={busy} onClick={() => update(!enabled)} className="min-h-11 rounded bg-[#163e3a] px-4 font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : enabled ? "Turn off public view" : "Turn on public view"}</button>
    </div>}
    {error && <p role="alert" className="mt-3 text-sm text-[#9a2e2e]">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm text-[#235d42]">{message}</p>}
    <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
      <Link href="/admin/family-members" className="underline underline-offset-4">Review people</Link>
      <Link href="/admin/family-relationships" className="underline underline-offset-4">Review connections</Link>
      <Link href="/family/tree?view=public" className="underline underline-offset-4">Preview public view</Link>
    </div>
  </section>;
}
