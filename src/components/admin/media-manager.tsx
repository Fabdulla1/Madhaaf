"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Upload } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import type { ConnectionPerson } from "./person-picker";
import { MEDIA_RULES } from "@/lib/media";
import { emptyMediaMetadata, MediaMetadataFields, MediaPeoplePicker, MediaStoryPicker, mediaButtonClass, mediaInputClass, metadataPayload, type MediaMetadata, type MediaStory, type MediaTargets } from "./media-fields";

export type MediaItem = {
  id: string; kind: "image" | "audio" | "video"; original_name: string; mime_type: string; bytes: number;
  title: string | null; subject_description: string | null; captured_on: string | null; location: string | null;
  alt_text: string | null; caption: string | null; speaker_name: string | null; attribution: string | null;
  consent_confirmed: boolean; public_approved: boolean; version: number; url?: string | null;
  is_public?: boolean; is_family_media?: boolean; member_ids?: string[]; article_ids?: string[];
  member_media?: Array<{ member_id: string; family_members: Pick<ConnectionPerson, "id" | "preferred_name" | "living_status"> | null }>;
  article_media?: Array<{ article_id: string; articles: MediaStory | null }>;
};
type AttachmentKind = "member_media" | "lexeme_media" | "example_media" | "article_media";
type MediaLink = { media_id: string; media_assets?: MediaItem };
const acceptedTypes = Object.keys(MEDIA_RULES).join(",");
const familyLinked = (item: MediaItem) => Boolean(item.is_family_media || item.member_ids?.length || item.member_media?.length);
const itemTitle = (item: MediaItem) => item.title || item.original_name;
const visibility = (item: MediaItem) => familyLinked(item) ? "Private family media" : item.is_public ? "Published in a story" : item.public_approved ? "Approved · awaiting story publication" : "Private";

async function loadAll<T>(path: string): Promise<T[]> {
  const records: T[] = [];
  for (let page = 1; ; page++) {
    const response = await fetch(`${path}${path.includes("?") ? "&" : "?"}page=${page}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw Error(result.error || "Could not load the library. Try again.");
    records.push(...(result.data || []));
    if (!result.pagination?.hasMore) return records;
  }
}

function useMediaTargets(): MediaTargets {
  const [people, setPeople] = useState<ConnectionPerson[]>([]);
  const [stories, setStories] = useState<MediaStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([loadAll<ConnectionPerson>("/api/admin/members?limit=200"), loadAll<MediaStory>("/api/admin/articles?limit=200")])
      .then(([members, articles]) => { if (active) { setPeople(members); setStories(articles); setError(""); } })
      .catch(() => { if (active) setError("People and stories could not be loaded. Retry to attach them, or upload with a description now."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  return { people, stories, loading, error, retry: () => { setLoading(true); setAttempt(value => value + 1); } };
}

export function MediaManager() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [detailMessage, setDetailMessage] = useState("");
  const [previewTrigger, setPreviewTrigger] = useState<HTMLElement | null>(null);
  const targets = useMediaTargets();
  const load = useCallback(async () => {
    try { setItems(await loadAll<MediaItem>("/api/admin/media")); setLoadError(""); }
    catch (cause) { setLoadError(cause instanceof Error ? cause.message : "Could not load media. Try again."); }
    finally { setLoading(false); }
  }, []);
  // All state changes happen after the asynchronous request resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);
  async function inspect(item: MediaItem) {
    if (!selected) setPreviewTrigger(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setOpening(item.id); setError(""); setDetailMessage("");
    try {
      const response = await fetch(`/api/admin/media/${item.id}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Cannot open media. Try again.");
      setSelected(result.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Cannot open media. Try again."); }
    finally { setOpening(null); }
  }
  const search = query.trim().toLocaleLowerCase();
  const visible = items.filter(item => (type === "all" || item.kind === type) &&
    [item.title, item.original_name, item.subject_description, item.location, ...(item.member_media || []).map(link => link.family_members?.preferred_name)].filter(Boolean).join(" ").toLocaleLowerCase().includes(search));
  return <>
    <h1 className="font-serif text-4xl sm:text-5xl">Media library</h1>
    <p className="mt-3 max-w-3xl leading-7 text-[#4f625f]">Preserve photographs, audio, and video with the people and stories behind them. Every upload starts private. Public use requires permission, an explicit approval, and a published story.</p>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4f625f]">Files linked to family profiles, including living people, always stay private. Dictionary attachments also stay private unless separately approved and published in a story.</p>
    {error && <p role="alert" className="mt-6 rounded border border-[#9a2e2e] p-4 text-[#9a2e2e]">{error}</p>}
    {message && <p role="status" className="mt-6 rounded border border-[#256b45] p-4 text-[#256b45]">{message}</p>}
    <div className="mt-10 grid min-w-0 gap-10 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <MediaUploadForm targets={targets} onUploaded={item => { setMessage(`${itemTitle(item)} was saved privately${item.member_media?.length ? " and linked to the selected people" : item.article_media?.length ? " and attached to the draft story" : ""}.`); void load(); }}/>
      <section className="min-w-0" aria-labelledby="stored-media-heading">
        <h2 id="stored-media-heading" className="font-serif text-2xl">Stored files</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
          <label className="min-w-0 text-sm font-semibold">Search media<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Title, person, place, or filename" className={mediaInputClass}/></label>
          <label className="text-sm font-semibold">File type<select value={type} onChange={event => setType(event.target.value)} className={mediaInputClass}><option value="all">All types</option><option value="image">Images</option><option value="audio">Audio</option><option value="video">Videos</option></select></label>
        </div>
        {loading ? <p role="status" className="mt-5 py-5 text-sm text-[#4f625f]">Loading the private library…</p> : loadError ? <div className="mt-5"><p role="alert" className="text-sm text-[#9a2e2e]">{loadError}</p><button type="button" onClick={() => { setLoading(true); void load(); }} className="mt-2 min-h-11 font-semibold underline">Retry loading media</button></div> : !items.length ? <p className="mt-5 border-t border-[#d8d3c8] py-6 text-[#4f625f]">The library is empty. Identify your first file, record permission, and upload it privately.</p> : <>
          <p role="status" className="mt-4 text-xs text-[#4f625f]">{visible.length} {visible.length === 1 ? "file" : "files"}{query || type !== "all" ? " match your filters" : " in the library"}.</p>
          {!visible.length && <p className="mt-4 text-sm text-[#4f625f]">No matching files. Try another title or clear the filters.</p>}
          <ul className="mt-3 divide-y divide-[#d8d3c8] border-t border-[#d8d3c8]">{visible.map(item => <li key={item.id} className="flex min-w-0 flex-wrap items-start justify-between gap-3 py-5">
            <div className="min-w-0 flex-1 basis-48"><h3 className="break-words font-semibold">{itemTitle(item)}</h3><p className="mt-1 text-xs font-semibold text-[#4f625f]">{visibility(item)}</p><p className="mt-1 text-xs capitalize text-[#4f625f]">{item.kind} · {(item.bytes / 1_000_000).toFixed(1)} MB · {item.consent_confirmed ? "Storage consent recorded" : "Consent needs review"}</p>{item.subject_description && <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-[#4f625f]">{item.subject_description}</p>}{item.title && <p className="mt-2 break-all text-xs text-[#687872]">{item.original_name}</p>}</div>
            <button type="button" disabled={opening !== null} aria-label={`Preview ${itemTitle(item)}`} onClick={() => void inspect(item)} className="min-h-11 px-2 text-sm font-semibold underline disabled:opacity-50">{opening === item.id ? "Opening…" : "Preview & details"}</button>
          </li>)}</ul>
        </>}
      </section>
    </div>
    {selected && <MediaDialog item={selected} returnFocus={previewTrigger} onClose={() => setSelected(null)}>
      {detailMessage && <p role="status" className="mt-5 text-sm text-[#256b45]">{detailMessage}</p>}
      <MediaMetadataEditor key={`${selected.id}-${selected.version}`} item={selected} onSaved={updated => { setSelected(updated); setDetailMessage("Media details saved."); void load(); }}/>
      <MediaAssociations item={selected} targets={targets} onChanged={() => { void inspect(selected); void load(); }}/>
    </MediaDialog>}
  </>;
}

function MediaUploadForm({ targets, onUploaded }: { targets: MediaTargets; onUploaded: (item: MediaItem) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<MediaMetadata>({ ...emptyMediaMetadata });
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [articleId, setArticleId] = useState("");
  const [error, setError] = useState("");
  const [stage, setStage] = useState("");
  const [pendingIntent, setPendingIntent] = useState<string | null>(null);
  const [formRevision, setFormRevision] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const kind = file?.type.split("/")[0];
  const busy = Boolean(stage);
  async function finalize(intentId: string) {
    setStage("Checking and saving your file…");
    const response = await fetch("/api/admin/media/finalize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intent_id: intentId }) });
    const result = await response.json();
    if (!response.ok) {
      if ([400, 404, 409].includes(response.status)) {
        setPendingIntent(null); setFile(null);
        if (fileInput.current) fileInput.current.value = "";
        throw Error(`${result.error || "This upload could not be completed."} Your details have been kept. Correct the issue and choose the file again.`);
      }
      throw Error(result.error || "Your file was transferred, but could not be saved. Retry saving below.");
    }
    setPendingIntent(null); setFile(null); setMetadata({ ...emptyMediaMetadata }); setMemberIds([]); setArticleId(""); setFormRevision(value => value + 1);
    if (fileInput.current) fileInput.current.value = "";
    onUploaded(result.data);
  }
  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current || (!file && !pendingIntent)) return;
    if (!metadata.title.trim() || !metadata.subject_description.trim() || !metadata.consent_confirmed) { setError("Add a title, describe the subject, and confirm storage permission before uploading."); return; }
    inFlight.current = true; setError("");
    try {
      if (pendingIntent) { await finalize(pendingIntent); return; }
      const selected = file!;
      const rule = Object.hasOwn(MEDIA_RULES, selected.type) ? MEDIA_RULES[selected.type] : null;
      if (!rule || !selected.size || selected.size > rule.max) throw Error("Choose a supported file within the size limit: images 10 MB, audio 25 MB, or MP4/WebM video 50 MB.");
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!url || !key) throw Error("Uploads are unavailable. Please contact an administrator.");
      setStage("Preparing your private upload…");
      const response = await fetch("/api/admin/media/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mime_type: selected.type, bytes: selected.size, original_name: selected.name, ...metadataPayload(metadata), member_ids: memberIds, article_id: articleId || null }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not prepare the upload. Your details have been kept.");
      const { intent_id, path, token } = result.data;
      setStage("Uploading your file privately…");
      const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const { error: uploadError } = await db.storage.from("heritage-media").uploadToSignedUrl(path, token, selected, { contentType: selected.type });
      if (uploadError) throw Error("The file could not be transferred. Check your connection and try again; your details have been kept.");
      setPendingIntent(intent_id);
      await finalize(intent_id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed. Your details have been kept."); }
    finally { setStage(""); inFlight.current = false; }
  }
  return <form key={formRevision} onSubmit={upload} className="min-w-0 self-start border border-[#d8d3c8] bg-[#fffcf6] p-5 sm:p-6">
    <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl"><Upload size={21} aria-hidden="true"/>Upload privately</h2>
    {error && <p role="alert" className="mb-5 rounded border border-[#9a2e2e] p-3 text-sm text-[#9a2e2e]">{error}</p>}
    <fieldset disabled={busy || Boolean(pendingIntent)} className="mb-6 min-w-0 border-b border-[#d8d3c8] pb-5 text-sm disabled:opacity-70">
      <label className="font-semibold">Photo, audio, or video<input ref={fileInput} type="file" accept={acceptedTypes} required onChange={event => { setFile(event.target.files?.[0] || null); setError(""); }} className="mt-3 block min-h-11 w-full min-w-0 text-sm"/></label>
      <p className="mt-2 text-xs leading-5 text-[#4f625f]">JPEG, PNG, or WebP images: 10 MB. MP3, M4A, Ogg, WebM, or WAV audio: 25 MB. MP4 or WebM videos: 50 MB.</p>
      {file && <p className="mt-2 break-all text-xs text-[#4f625f]">{file.name} · {(file.size / 1_000_000).toFixed(1)} MB</p>}
    </fieldset>
    <MediaMetadataFields value={metadata} onChange={setMetadata} kind={kind} disabled={busy || Boolean(pendingIntent)} requireConsent/>
    <fieldset disabled={busy || Boolean(pendingIntent)} className="mt-6 min-w-0 border-t border-[#d8d3c8] pt-5 disabled:opacity-70">
      <legend className="px-1 font-serif text-xl">People and intended story</legend>
      {targets.error && <div className="mb-4"><p role="alert" className="text-sm text-[#9a2e2e]">{targets.error}</p><button type="button" onClick={targets.retry} className="min-h-11 text-sm font-semibold underline">Retry loading people and stories</button></div>}
      <MediaPeoplePicker targets={targets} value={memberIds} onChange={ids => { setMemberIds(ids); if (ids.length) setArticleId(""); }} disabled={busy || Boolean(pendingIntent)}/>
      {memberIds.length ? <p className="mt-4 text-sm leading-6 text-[#4f625f]">This file will be attached to the selected family profiles and kept private. Family media cannot be attached to public stories.</p> : <div className="mt-5"><MediaStoryPicker stories={targets.stories} value={articleId} onChange={setArticleId} disabled={targets.loading || Boolean(targets.error)}/></div>}
    </fieldset>
    {stage && <p role="status" className="mt-5 text-sm font-semibold">{stage}</p>}
    {pendingIntent && !busy && <p className="mt-4 text-sm leading-6 text-[#4f625f]">The file has already been transferred. Retry saving to complete the same upload without sending it again.</p>}
    <button disabled={busy || (!file && !pendingIntent)} className={`${mediaButtonClass} mt-5 min-h-12 w-full`}>{busy ? "Please wait…" : pendingIntent ? "Retry saving upload" : "Upload to private library"}</button>
  </form>;
}

function MediaDialog({ item, children, onClose, returnFocus }: { item: MediaItem; children: React.ReactNode; onClose: () => void; returnFocus: HTMLElement | null }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const trigger = returnFocus;
    dialog?.showModal();
    return () => { dialog?.close(); requestAnimationFrame(() => { if (trigger?.isConnected) trigger.focus({ preventScroll: true }); }); };
  }, [returnFocus]);
  return <dialog ref={ref} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded border border-[#aaa99e] bg-[#fffcf6] p-5 text-[#163e3a] shadow-xl backdrop:bg-black/60 sm:p-8">
    <div className="flex items-start justify-between gap-4"><div className="min-w-0"><h2 id={titleId} className="break-words font-serif text-2xl">{itemTitle(item)}</h2><p className="mt-2 text-sm font-semibold text-[#4f625f]">{visibility(item)}</p></div><button type="button" onClick={onClose} className="min-h-11 shrink-0 px-2 font-semibold underline">Close</button></div>
    {item.url ? item.kind === "audio" ? <audio controls preload="metadata" aria-label={itemTitle(item)} src={item.url} className="mt-6 w-full">Your browser cannot play this recording.</audio> : item.kind === "video" ? <video controls playsInline preload="metadata" aria-label={itemTitle(item)} src={item.url} className="mt-6 max-h-[55vh] w-full bg-black">Your browser cannot play this video.</video> : <Image unoptimized src={item.url} alt={item.alt_text || item.subject_description || itemTitle(item)} width={900} height={600} className="mt-6 max-h-[55vh] w-full object-contain"/> : <p className="mt-6 text-sm text-[#4f625f]">Preview unavailable. You can still review and save the details below.</p>}
    {item.caption && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4f625f]">{item.caption}</p>}
    {children}
  </dialog>;
}

function MediaMetadataEditor({ item, onSaved }: { item: MediaItem; onSaved: (item: MediaItem) => void }) {
  const [value, setValue] = useState<MediaMetadata>(() => Object.fromEntries(Object.keys(emptyMediaMetadata).map(key => [key, item[key as keyof MediaMetadata] ?? emptyMediaMetadata[key as keyof MediaMetadata]])) as MediaMetadata);
  const [approved, setApproved] = useState(item.public_approved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const family = familyLinked(item);
  const hasStory = Boolean(item.article_ids?.length || item.article_media?.length);
  const approvalReady = !family && hasStory && value.consent_confirmed && value.title.trim() && value.subject_description.trim() && (item.kind !== "image" || value.alt_text.trim());
  async function update(patch: Record<string, unknown>) {
    if (busy) return; setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/media/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ version: item.version, ...patch }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not save media details. Your changes have been kept.");
      onSaved({ ...result.data, url: result.data.url || item.url });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save media details."); }
    finally { setBusy(false); }
  }
  function save(event: React.FormEvent) {
    event.preventDefault();
    void update({ ...metadataPayload(value), public_approved: Boolean(approved && approvalReady) });
  }
  return <form onSubmit={save} className="mt-7 min-w-0 border-t border-[#d8d3c8] pt-6">
    {error && <p role="alert" className="mb-4 text-sm text-[#9a2e2e]">{error}</p>}
    <MediaMetadataFields value={value} onChange={next => { setValue(next); if (!next.consent_confirmed) setApproved(false); }} kind={item.kind} disabled={busy}/>
    <fieldset disabled={busy} className="mt-6 border-t border-[#d8d3c8] pt-5 text-sm">
      <legend className="px-1 font-serif text-xl">Review public use</legend>
      {family ? <p className="leading-6 text-[#4f625f]">This file is linked to a family profile or portrait and must stay private.</p> : <>
        <p className="mb-3 leading-6 text-[#4f625f]">Approve only after confirming permission to share this media publicly. Approval applies to the attached stories; it does not publish a draft.</p>
        {!!item.article_media?.length && <ul aria-label="Stories covered by public approval" className="mb-3 list-inside list-disc space-y-1 text-[#4f625f]">{item.article_media.map(link => <li key={link.article_id} className="break-words">{link.articles?.title || "Attached story"} ({link.articles?.status || "status unavailable"})</li>)}</ul>}
        {!hasStory && <p className="mb-3 text-sm text-[#4f625f]">Attach this file to a draft story below before approving public use.</p>}
        <label className="flex min-h-11 items-start gap-3 font-semibold"><input type="checkbox" checked={approved} disabled={!approvalReady && !approved} onChange={event => setApproved(event.target.checked)} className="mt-1 size-4 shrink-0"/>Approve public use in the attached stories</label>
        {!value.consent_confirmed && <p className="mt-2 text-xs text-[#4f625f]">Storage consent is required before public approval.</p>}
        {item.kind === "image" && !value.alt_text.trim() && <p className="mt-2 text-xs text-[#4f625f]">Add alternative text before public approval.</p>}
        {approved && item.article_media?.some(link => link.articles?.status === "published") && <p className="mt-3 font-semibold leading-6">Saving this approval makes the file public in the attached published story.</p>}
        {item.public_approved && (!approved || !approvalReady) && <p className="mt-3 leading-6 text-[#4f625f]">Saving removes public access to this file unless all approval requirements are met and approval remains selected.</p>}
      </>}
      {(item.public_approved || item.is_public) && <div className="mt-4 border-t border-[#d8d3c8] pt-3"><button type="button" disabled={busy} onClick={() => void update({ public_approved: false })} className="min-h-11 font-semibold text-[#9a2e2e] underline disabled:opacity-50">Remove public access</button><p className="mt-1 text-xs leading-5 text-[#4f625f]">Immediately withdraws approval from every attached story. You do not need to complete or save other details first.</p></div>}
    </fieldset>
    <button disabled={busy} className={`${mediaButtonClass} mt-5`}>{busy ? "Saving…" : "Save details"}</button>
  </form>;
}

function MediaAssociations({ item, targets, onChanged }: { item: MediaItem; targets: MediaTargets; onChanged: () => void }) {
  const [people, setPeople] = useState<string[]>([]);
  const [story, setStory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function link(kind: "member_media" | "article_media", owner: string, method: "POST" | "DELETE") {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/links", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, [kind === "member_media" ? "member_id" : "article_id"]: owner, media_id: item.id }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not update this attachment. Try again.");
      setPeople([]); setStory(""); onChanged();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update this attachment."); }
    finally { setBusy(false); }
  }
  const family = familyLinked(item);
  const canAddPerson = !item.public_approved && !(item.article_media?.length || item.article_ids?.length);
  return <section className="mt-7 min-w-0 border-t border-[#d8d3c8] pt-6 text-sm">
    <h3 className="font-serif text-xl">Attached people and stories</h3>
    {error && <p role="alert" className="mt-4 text-[#9a2e2e]">{error}</p>}
    {targets.error && <div className="mt-3"><p role="alert" className="text-[#9a2e2e]">People and stories could not be loaded. Your existing attachments are unchanged.</p><button type="button" disabled={targets.loading} onClick={targets.retry} className="min-h-11 font-semibold underline disabled:opacity-50">Retry loading people and stories</button></div>}
    {!!item.member_media?.length && <ul className="mt-4 divide-y divide-[#d8d3c8]">{item.member_media.map(linked => <li key={linked.member_id} className="flex flex-wrap items-center justify-between gap-3 py-2"><Link href={`/admin/family-members/${linked.member_id}`} className="min-h-11 content-center font-semibold underline">{linked.family_members?.preferred_name || "Family profile"}</Link><button type="button" disabled={busy} onClick={() => void link("member_media", linked.member_id, "DELETE")} className="min-h-11 px-2 font-semibold underline disabled:opacity-50">Detach person</button></li>)}</ul>}
    {!!item.article_media?.length && <ul className="mt-4 divide-y divide-[#d8d3c8]">{item.article_media.map(linked => <li key={linked.article_id} className="flex flex-wrap items-center justify-between gap-3 py-2"><div><Link href={`/admin/history/${linked.article_id}`} className="min-h-11 content-center font-semibold underline">{linked.articles?.title || "Story"}</Link><p className="mt-1 text-xs capitalize text-[#4f625f]">{linked.articles?.status || "Status unavailable"}</p></div><button type="button" disabled={busy || linked.articles?.status === "published"} onClick={() => void link("article_media", linked.article_id, "DELETE")} className="min-h-11 px-2 font-semibold underline disabled:opacity-50">Detach story</button></li>)}</ul>}
    {item.is_family_media && !item.member_media?.length && <p className="mt-3 text-[#4f625f]">This file is used as a family portrait. Change that assignment in the family profile.</p>}
    {item.article_media?.some(link => link.articles?.status === "published") && <p className="mt-3 text-xs leading-5 text-[#4f625f]">Move a story to draft in its editor before changing its attachments.</p>}
    {item.public_approved && <p className="mt-3 text-xs leading-5 text-[#4f625f]">Approval applies to every attached story. New story attachments stay private until that story is published. To link a family profile, remove public approval and detach all stories first.</p>}
    {canAddPerson && <div className="mt-5"><MediaPeoplePicker targets={{ ...targets, people: targets.people.filter(person => !item.member_ids?.includes(person.id) && !item.member_media?.some(link => link.member_id === person.id)) }} value={people} onChange={ids => setPeople(ids.slice(-1))} disabled={busy}/><button type="button" disabled={busy || people.length !== 1} onClick={() => void link("member_media", people[0], "POST")} className={`${mediaButtonClass} mt-3`}>Attach person privately</button></div>}
    {!canAddPerson && !family && !item.public_approved && <p className="mt-4 leading-6 text-[#4f625f]">Detach this file from its stories before linking a family profile. Family media stays private.</p>}
    {!family && <div className="mt-5"><MediaStoryPicker stories={targets.stories.filter(article => !item.article_ids?.includes(article.id) && !item.article_media?.some(link => link.article_id === article.id))} value={story} onChange={setStory} disabled={busy || targets.loading}/><button type="button" disabled={busy || !story} onClick={() => void link("article_media", story, "POST")} className={`${mediaButtonClass} mt-3`}>Attach to story</button></div>}
  </section>;
}

export function MediaAttachment({ kind, ownerId, purpose, disabled = false }: { kind: AttachmentKind; ownerId: string; purpose?: "pronunciation" | "other"; disabled?: boolean }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [links, setLinks] = useState<MediaLink[]>([]);
  const [id, setId] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchId = useId();
  const ownerKey = kind === "member_media" ? "member_id" : kind === "lexeme_media" ? "lexeme_id" : kind === "example_media" ? "example_id" : "article_id";
  const load = useCallback(async () => {
    try {
      const [media, response] = await Promise.all([loadAll<MediaItem>("/api/admin/media"), fetch(`/api/admin/links?kind=${kind}&owner_id=${ownerId}`, { cache: "no-store" })]);
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not load attachments. Try again.");
      setItems(media); setLinks(result.data || []); setError(""); return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load attachments."); return false; }
    finally { setLoading(false); }
  }, [kind, ownerId]);
  // All state changes happen after the asynchronous request resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);
  async function act(method: "POST" | "DELETE", mediaId: string) {
    if (disabled || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/links", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, [ownerKey]: ownerId, media_id: mediaId, ...(kind === "lexeme_media" ? { purpose: purpose || "other" } : {}) }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not update attachment.");
      setId(""); const refreshed = await load();
      if (refreshed) setMessage(method === "POST" ? "File attached. Its publication status has not changed." : "File detached.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update attachment."); }
    finally { setBusy(false); }
  }
  const linkedIds = new Set(links.map(link => link.media_id));
  const available = items.filter(item => !linkedIds.has(item.id) && (purpose !== "pronunciation" || item.kind === "audio") &&
    (kind !== "article_media" || !familyLinked(item)) &&
    (kind !== "member_media" || (!item.public_approved && !(item.article_ids?.length || item.article_media?.length))) &&
    (item.id === id || [item.title, item.original_name, item.subject_description].filter(Boolean).join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())));
  return <section className="mt-9 min-w-0 border-t border-[#d8d3c8] pt-7">
    <h2 className="font-serif text-2xl">{purpose === "pronunciation" ? "Pronunciation recording" : "Attached media"}</h2>
    <p className="mt-2 text-sm leading-6 text-[#4f625f]">Upload and describe files in the <Link href="/admin/media" className="underline">media library</Link>, then attach them here.</p>
    <p className="mt-2 text-xs leading-5 text-[#4f625f]">{kind === "article_media" ? "Choose media that is not linked to a family profile. Review public-use permission in the library before publishing this story." : kind === "member_media" ? "Family media always stays private. Files attached to stories or approved for public use cannot be linked here." : "Dictionary attachments stay private unless separately approved and published in a story."}</p>
    {error && <div className="mt-3"><p role="alert" className="text-sm text-[#9a2e2e]">{error}</p><button type="button" disabled={busy || loading} onClick={() => { setLoading(true); void load(); }} className="min-h-11 text-sm font-semibold underline">Retry loading attachments</button></div>}
    {message && <p role="status" className="mt-3 text-sm text-[#256b45]">{message}</p>}
    {loading && <p role="status" className="mt-3 text-sm text-[#4f625f]">Loading attachments…</p>}
    {!disabled && <div className="mt-4 min-w-0"><label htmlFor={searchId} className="text-sm font-semibold">Search stored files</label><input id={searchId} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Title, filename, or subject" disabled={loading || busy} className={mediaInputClass}/><div className="mt-3 flex flex-wrap gap-2"><select aria-label="Choose stored file" value={id} onChange={event => setId(event.target.value)} disabled={loading || busy} className="min-h-11 min-w-0 flex-1 rounded border border-[#aaa99e] bg-white p-2"><option value="">Choose a stored file</option>{available.map(item => <option key={item.id} value={item.id}>{itemTitle(item)} ({item.kind})</option>)}</select><button type="button" disabled={!id || busy || loading} onClick={() => void act("POST", id)} className={mediaButtonClass}>Attach</button></div></div>}
    <ul className="mt-4 divide-y divide-[#d8d3c8]">{links.map(link => { const item = items.find(asset => asset.id === link.media_id) || link.media_assets; return <li key={link.media_id} className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-3 text-sm"><div className="min-w-0 flex-1"><p className="break-words font-semibold">{item ? itemTitle(item) : "Attached file"}</p>{item && <p className="mt-1 text-xs text-[#4f625f]">{visibility(item)}</p>}</div>{!disabled && <button type="button" disabled={busy} onClick={() => void act("DELETE", link.media_id)} className="min-h-11 px-2 font-semibold text-[#9a2e2e] underline disabled:opacity-50">Detach</button>}</li>; })}</ul>
    {!loading && !error && !links.length && <p className="mt-3 text-sm text-[#4f625f]">No media attached yet.</p>}
  </section>;
}
