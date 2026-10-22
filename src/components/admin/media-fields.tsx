"use client";

import { useId, useState } from "react";
import { PersonPicker, type ConnectionPerson } from "./person-picker";

export const mediaInputClass = "mt-2 min-h-11 w-full min-w-0 rounded border border-[#aaa99e] bg-white p-3 outline-none focus:border-[#163e3a] focus:ring-2 focus:ring-[#cad7cd] disabled:opacity-60";
export const mediaButtonClass = "min-h-11 rounded bg-[#163e3a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
export type MediaMetadata = {
  title: string; subject_description: string; captured_on: string; location: string;
  alt_text: string; caption: string; speaker_name: string; attribution: string; consent_confirmed: boolean;
};
export const emptyMediaMetadata: MediaMetadata = { title: "", subject_description: "", captured_on: "", location: "", alt_text: "", caption: "", speaker_name: "", attribution: "", consent_confirmed: false };
export type MediaStory = { id: string; title: string; status: string };
export type MediaTargets = { people: ConnectionPerson[]; stories: MediaStory[]; loading: boolean; error: string; retry: () => void };

export function metadataPayload(value: MediaMetadata) {
  return Object.fromEntries(Object.entries(value).map(([key, field]) => [key, typeof field === "string" ? field.trim() || null : field]));
}

export function MediaMetadataFields({ value, onChange, kind, disabled, requireConsent = false }: {
  value: MediaMetadata; onChange: (value: MediaMetadata) => void; kind?: string; disabled?: boolean; requireConsent?: boolean;
}) {
  function change<K extends keyof MediaMetadata>(key: K, next: MediaMetadata[K]) { onChange({ ...value, [key]: next }); }
  return <fieldset disabled={disabled} className="grid min-w-0 gap-4 text-sm disabled:opacity-70">
    <legend className="mb-4 font-serif text-xl">Identify this media</legend>
    <p className="text-xs leading-5 text-[#4f625f]">The title, subject description, date, and place are private archive metadata.</p>
    <label className="font-semibold">Title<input required maxLength={200} value={value.title} onChange={event => change("title", event.target.value)} placeholder="For example, Family gathering in Mombasa" className={mediaInputClass}/></label>
    <label className="font-semibold">Who or what is in this file?<textarea required maxLength={2000} value={value.subject_description} onChange={event => change("subject_description", event.target.value)} rows={3} placeholder="Describe the people, event, place, or subject. Record what is unknown." className={mediaInputClass}/><span className="mt-1 block text-xs font-normal leading-5 text-[#4f625f]">Private archive context. Add people below when they have a family profile.</span></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="font-semibold">Date recorded <span className="font-normal">(optional)</span><input type="date" value={value.captured_on} onChange={event => change("captured_on", event.target.value)} className={mediaInputClass}/></label>
      <label className="font-semibold">Place <span className="font-normal">(optional)</span><input maxLength={300} value={value.location} onChange={event => change("location", event.target.value)} className={mediaInputClass}/></label>
    </div>
    <p className="text-xs leading-5 text-[#4f625f]">Leave dates and places blank when unknown. Approximate dates can go in the description.</p>
    <div className="mt-2 border-t border-[#d8d3c8] pt-4"><h3 className="font-semibold">Details for story display</h3><p className="mt-2 text-xs leading-5 text-[#4f625f]">Alternative text, caption, speaker name, and credit may be shown publicly with an approved, published story.</p></div>
    {kind === "image" && <label className="font-semibold">Alternative text<input maxLength={500} value={value.alt_text} onChange={event => change("alt_text", event.target.value)} className={mediaInputClass}/><span className="mt-1 block text-xs font-normal leading-5 text-[#4f625f]">A concise description for people who cannot see the image. Required before public use.</span></label>}
    <label className="font-semibold">Public caption <span className="font-normal">(optional)</span><textarea maxLength={2000} value={value.caption} onChange={event => change("caption", event.target.value)} rows={2} className={mediaInputClass}/><span className="mt-1 block text-xs font-normal leading-5 text-[#4f625f]">Shown publicly only when this file is explicitly approved and published in a story.</span></label>
    {(kind === "audio" || kind === "video") && <label className="font-semibold">Speaker or performer <span className="font-normal">(optional)</span><input maxLength={200} value={value.speaker_name} onChange={event => change("speaker_name", event.target.value)} className={mediaInputClass}/></label>}
    <label className="font-semibold">Creator, credit, or source <span className="font-normal">(optional)</span><input maxLength={1000} value={value.attribution} onChange={event => change("attribution", event.target.value)} className={mediaInputClass}/></label>
    <label className="flex min-h-11 items-start gap-3 font-semibold"><input type="checkbox" required={requireConsent} checked={value.consent_confirmed} onChange={event => change("consent_confirmed", event.target.checked)} className="mt-1 size-4 shrink-0"/>Consent for private storage has been recorded.</label>
    <p className="text-xs leading-5 text-[#4f625f]">Confirm permission from the creator and identifiable people, or the authority to preserve this material. Public sharing requires a separate review.</p>
  </fieldset>;
}

export function MediaPeoplePicker({ targets, value, onChange, disabled }: {
  targets: MediaTargets; value: string[]; onChange: (ids: string[]) => void; disabled?: boolean;
}) {
  return <section className="min-w-0 text-sm">
    <h3 className="font-semibold">People in this file <span className="font-normal">(optional)</span></h3>
    <p className="mt-2 text-xs leading-5 text-[#4f625f]">Link existing family profiles, including living people. Family-linked media always stays private.</p>
    {value.length > 0 && <ul aria-label="People attached to media" className="mt-3 divide-y divide-[#d8d3c8] border-y border-[#d8d3c8]">
      {value.map(id => { const person = targets.people.find(item => item.id === id); return <li key={id} className="flex items-center justify-between gap-3 py-2"><div className="min-w-0"><p className="break-words font-semibold">{person?.preferred_name || "Selected family profile"}</p>{person && <p className="text-xs capitalize text-[#4f625f]">{person.living_status}</p>}</div><button type="button" disabled={disabled} aria-label={`Remove ${person?.preferred_name || "person"}`} onClick={() => onChange(value.filter(item => item !== id))} className="min-h-11 shrink-0 px-2 font-semibold underline disabled:opacity-50">Remove</button></li>; })}
    </ul>}
    {value.length < 20 && <div className="mt-4"><PersonPicker label="Add a person" required={false} people={targets.people.filter(person => person.status !== "archived" && !value.includes(person.id))} value="" onChange={id => { if (id) onChange([...value, id]); }} loading={targets.loading} failed={Boolean(targets.error)} disabled={Boolean(disabled) || targets.loading}/></div>}
    {value.length >= 20 && <p role="status" className="mt-2 text-xs text-[#4f625f]">Up to 20 people can be linked to a file.</p>}
  </section>;
}

export function MediaStoryPicker({ stories, value, onChange, disabled }: {
  stories: MediaStory[]; value: string; onChange: (id: string) => void; disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const id = useId();
  const available = stories.filter(story => (story.status === "draft" || story.status === "review") && (story.id === value || story.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())));
  return <div className="min-w-0 text-sm">
    <label htmlFor={`${id}-search`} className="font-semibold">Find a draft story <span className="font-normal">(optional)</span></label>
    <input id={`${id}-search`} type="search" disabled={disabled} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search story titles" className={mediaInputClass}/>
    <label htmlFor={`${id}-story`} className="mt-3 block font-semibold">Attach to a draft story</label>
    <select id={`${id}-story`} disabled={disabled} value={value} onChange={event => onChange(event.target.value)} className={mediaInputClass}>
      <option value="">Keep in the library for now</option>
      {available.map(story => <option key={story.id} value={story.id}>{story.title} ({story.status === "review" ? "in review" : "draft"})</option>)}
    </select>
    <p className="mt-2 text-xs leading-5 text-[#4f625f]">Attaching a file does not publish it. Only draft or review stories can accept new attachments.</p>
  </div>;
}
