"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useWatch, type Control } from "react-hook-form";
import type { EditorValues } from "@/lib/admin-config";
import type { DuplicateConfirmation, DuplicateEntity, DuplicateMatch, DuplicateReview } from "@/lib/duplicate-matching";

function ReviewModal({ title, children, onDismiss }: { title: string; children: React.ReactNode; onDismiss: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      // React removes the dialog before passive cleanup; restore focus once
      // the initiating save button has also left its busy state.
      requestAnimationFrame(() => { if (trigger?.isConnected && !dialog?.open) trigger.focus({ preventScroll: true }); });
    };
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onDismiss(); }}
    className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded border border-[#aaa99e] bg-[#fffcf6] p-5 text-[#163e3a] shadow-xl backdrop:bg-black/50 sm:p-8">
    <div className="flex items-start justify-between gap-4"><h2 id={titleId} className="font-serif text-2xl">{title}</h2><button type="button" onClick={onDismiss} className="min-h-11 shrink-0 px-2 text-sm font-semibold underline">Close</button></div>
    {children}
  </dialog>;
}

function MatchInfo({ match, entity, onUse }: { match: DuplicateMatch; entity: DuplicateEntity; onUse?: (match: DuplicateMatch) => void }) {
  const href = `/admin/${entity === "dictionary" ? "dictionary" : "family-members"}/${match.id}`;
  return <article className="min-w-0 break-words rounded border border-[#d8d3c8] bg-white p-4">
    <h3 className="font-serif text-xl">{match.label}</h3>
    <p className="mt-1 text-xs capitalize text-[#4f625f]">{match.exact ? "Exact match" : "Similar match"} · {match.status}</p>
    {match.matchedText !== match.label && <p className="mt-2 text-sm">Matching {entity === "dictionary" ? "spelling" : "name"}: <strong>{match.matchedText}</strong></p>}
    <p className="mt-3 text-sm leading-6">{match.summary || (entity === "dictionary" ? "No meaning recorded yet." : "No short biography recorded yet.")}</p>
    <dl className="mt-3 space-y-2 text-sm">{match.details.map((detail, index) => <div key={index}><dt className="font-semibold">{detail.label}</dt><dd className="mt-1 whitespace-pre-wrap text-[#4f625f]">{detail.value}</dd></div>)}</dl>
    <div className="mt-4 flex flex-wrap gap-3">
      <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">Open existing {entity === "dictionary" ? "entry" : "profile"} in new tab</a>
      {onUse && <button type="button" onClick={() => onUse(match)} className="min-h-11 rounded border border-[#163e3a] px-3 font-semibold">Use this person</button>}
    </div>
  </article>;
}

export function DuplicateSuggestions({ entity, value, onUse }: { entity: DuplicateEntity; value: string; onUse?: (match: DuplicateMatch) => void }) {
  const query = value.trim();
  const [result, setResult] = useState<{ query: string; review?: DuplicateReview; failed?: boolean } | null>(null);
  const [selected, setSelected] = useState<DuplicateMatch | null>(null);
  const current = result?.query === query ? result : null;
  useEffect(() => {
    if (!query || query.length > 200) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ entity, q: query });
        const response = await fetch(`/api/admin/duplicates?${params}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw Error("Suggestions unavailable");
        const { data }: { data: DuplicateReview } = await response.json();
        if (!controller.signal.aborted) setResult({ query, review: data });
      } catch { if (!controller.signal.aborted) setResult({ query, failed: true }); }
    }, 300);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [query, entity]);
  if (!query || query.length > 200) return null;
  return <div className="mt-3 text-sm">
    <p role="status" aria-live="polite" className="text-xs leading-5 text-[#4f625f]">{!current ? "Checking for existing matches…" : current.failed ? "Suggestions are unavailable. Saving will check for exact matches again." : current.review?.matches.length ? entity === "dictionary" ? "Did you mean one of these words? Select a suggestion to preview it." : "Could this be someone already recorded? Select a person to preview their details." : "No matching records found."}</p>
    {!!current?.review?.matches.length && <ul aria-label={entity === "dictionary" ? "Similar dictionary entries" : "Similar people"} className="mt-2 space-y-2">
      {current.review.matches.map(match => <li key={match.id}><button type="button" onClick={() => setSelected(match)}
        className="min-h-12 w-full break-words rounded border border-[#cad7cd] bg-[#edf1ec] px-3 py-3 text-left hover:border-[#163e3a] focus-visible:outline-2 focus-visible:outline-offset-2">
        <span className="font-semibold">{match.label}</span><span className="ml-2 text-xs text-[#4f625f]">{match.exact ? "Exact match" : "Similar"}</span>
        {match.summary && <span className="mt-1 block break-words text-xs leading-5 text-[#4f625f]">{match.summary}</span>}
      </button></li>)}
    </ul>}
    {current?.review?.hasMore && <p className="mt-2 text-xs text-[#4f625f]">Showing the closest matches. Keep typing to narrow the suggestions.</p>}
    {selected && <ReviewModal title={entity === "dictionary" ? "Existing word preview" : "Existing person preview"} onDismiss={() => setSelected(null)}>
      <div className="mt-5"><MatchInfo match={selected} entity={entity} onUse={onUse ? match => { setSelected(null); onUse(match); } : undefined}/></div>
      <button type="button" onClick={() => setSelected(null)} className="mt-5 min-h-11 rounded border border-[#163e3a] px-4 font-semibold">Keep editing</button>
    </ReviewModal>}
  </div>;
}

export function FormDuplicateSuggestions({ entity, control }: { entity: DuplicateEntity; control: Control<EditorValues> }) {
  const value = useWatch({ control, name: entity === "dictionary" ? "headword" : "preferred_name" });
  return <DuplicateSuggestions entity={entity} value={typeof value === "string" ? value : ""}/>;
}

/** Recheck on every POST; consent applies only to this submitted snapshot. */
export function useDuplicateReview(onUse?: (match: DuplicateMatch) => void) {
  const [pending, setPending] = useState<{ review: DuplicateReview; meaning?: string } | null>(null);
  const decision = useRef<((value: DuplicateConfirmation | null) => void) | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; decision.current?.(null); }; }, []);
  function finish(confirmation: DuplicateConfirmation | null) {
    const resolve = decision.current; decision.current = null; setPending(null); resolve?.(confirmation);
  }
  async function submit(url: string, payload: Record<string, unknown>, method = "POST"): Promise<Response | null> {
    if (inFlight.current) return null;
    inFlight.current = true;
    let body = payload;
    try {
      for (;;) {
        const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (response.status !== 409) return response;
        const result = await response.clone().json();
        if (result.code !== "DUPLICATE_REVIEW_REQUIRED" || !result.review) return response;
        if (!mounted.current) return null;
        const review: DuplicateReview = result.review;
        const confirmation = await new Promise<DuplicateConfirmation | null>(resolve => {
          decision.current = resolve; setPending({ review, meaning: typeof payload.gloss_en === "string" ? payload.gloss_en : undefined });
        });
        if (!confirmation) return null;
        body = { ...payload, duplicate_confirmation: confirmation };
      }
    } finally { inFlight.current = false; }
  }
  const review = pending?.review;
  const dialog = review && <ReviewModal title={review.entity === "dictionary" ? "This spelling already exists" : "This name already exists"} onDismiss={() => finish(null)}>
    <p className="mt-4 break-words leading-6">We found {review.exactIds.length} existing {review.entity === "dictionary" ? review.exactIds.length === 1 ? "entry" : "entries" : review.exactIds.length === 1 ? "profile" : "profiles"} with the same {review.entity === "dictionary" ? "spelling" : "name"} as <strong>{review.query}</strong>. Review the details before creating another.</p>
    {pending.meaning && <p className="mt-3 text-sm"><strong>Your new meaning:</strong> {pending.meaning}</p>}
    <div className="mt-5 space-y-3">{review.matches.map(match => <MatchInfo key={match.id} match={match} entity={review.entity} onUse={onUse ? match => { finish(null); onUse(match); } : undefined}/>)}</div>
    {review.hasMore && <p className="mt-3 text-sm">Showing the first 10 matches. More entries share this spelling or name.</p>}
    <p className="mt-5 text-sm leading-6">{review.entity === "dictionary" ? "If this is the same word, open its existing entry to add a meaning or example. If the spelling is shared by a different meaning that needs its own entry, confirm below." : "Matching names can belong to different people. Check the dates, birthplace, and biography, then confirm only if this is someone else."}</p>
    <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => finish(null)} className="min-h-12 rounded border border-[#163e3a] px-4 font-semibold">Keep editing</button>
      <button type="button" onClick={() => finish({ entity: review.entity, query: review.query, matched_ids: review.exactIds })} className="min-h-12 rounded bg-[#163e3a] px-4 font-semibold text-white">{review.entity === "dictionary" ? "Different meaning — save new entry" : "Different person — save new profile"}</button></div>
  </ReviewModal>;
  return { submit, dialog };
}
