"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { normalizeDuplicateText } from "@/lib/duplicate-matching";

export type ConnectionPerson = {
  id: string; preferred_name: string; status: string; visibility: string; living_status: string;
  birth_date_text?: string | null; death_date_text?: string | null;
  birthplace?: string | null; short_bio?: string | null;
};

function personDetails(person: ConnectionPerson) {
  return [person.birth_date_text && `Born ${person.birth_date_text}`, person.death_date_text && `Died ${person.death_date_text}`, person.birthplace].filter(Boolean).join(" · ");
}

export function PersonPicker({ label, people, value, onChange, excludeId, loading, failed, disabled }: {
  label: string; people: ConnectionPerson[]; value: string; onChange: (id: string) => void;
  excludeId?: string; loading: boolean; failed: boolean; disabled: boolean;
}) {
  const id = useId(), listId = `${id}-people`, statusId = `${id}-status`;
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const selected = people.find(person => person.id === value);
  const text = selected?.preferred_name ?? query;
  const valid = Boolean(selected && selected.id !== excludeId);
  const indexed = useMemo(() => people.map(person => ({ person, search: normalizeDuplicateText(
    [person.preferred_name, person.birth_date_text, person.death_date_text, person.birthplace].filter(Boolean).join(" "), "people",
  ) })).sort((a, b) => a.person.preferred_name.localeCompare(b.person.preferred_name) || a.person.id.localeCompare(b.person.id)), [people]);
  const tokens = normalizeDuplicateText(text, "people").split(" ").filter(Boolean);
  const matches = indexed.filter(({ person, search }) => person.id !== excludeId && tokens.every(token => search.includes(token))).map(({ person }) => person);
  const active = matches.findIndex(person => person.id === activeId);
  const expanded = open && !disabled;

  useEffect(() => { input.current?.setCustomValidity(valid ? "" : "Choose a person from the suggestions."); }, [valid]);
  useEffect(() => {
    if (expanded && activeId) document.getElementById(`${listId}-${activeId}`)?.scrollIntoView({ block: "nearest" });
  }, [activeId, expanded, listId]);

  function choose(person: ConnectionPerson) {
    onChange(person.id); setQuery(""); setOpen(false); setActiveId(null); setInvalid(false);
  }

  return <div className="min-w-0">
    <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
    <div className="relative">
      <input ref={input} id={id} role="combobox" required disabled={disabled} autoComplete="off" maxLength={300}
        aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? listId : undefined}
        aria-activedescendant={expanded && active >= 0 ? `${listId}-${activeId}` : undefined}
        aria-describedby={statusId} aria-invalid={invalid && !valid || undefined}
        value={text} placeholder="Type a name to find a person"
        onFocus={() => { setOpen(true); setActiveId(null); }}
        onBlur={() => { setOpen(false); setActiveId(null); }}
        onInvalid={() => setInvalid(true)}
        onChange={event => { setQuery(event.target.value); onChange(""); setOpen(true); setActiveId(null); setInvalid(false); }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true);
            const next = event.key === "ArrowDown" ? (active + 1) % matches.length : (active <= 0 ? matches.length - 1 : active - 1);
            setActiveId(matches[next]?.id ?? null);
          } else if (event.key === "Enter" && expanded) {
            event.preventDefault(); if (active >= 0) choose(matches[active]);
          } else if (event.key === "Escape" && expanded) { event.preventDefault(); setOpen(false); setActiveId(null); }
        }}
        className="mt-2 min-h-12 w-full min-w-0 rounded border border-[#aaa99e] bg-white p-3 outline-none focus:border-[#163e3a] focus:ring-2 focus:ring-[#cad7cd] disabled:opacity-60"/>
      {expanded && <ul id={listId} role="listbox" aria-label={`${label} suggestions`} aria-busy={loading}
        className="absolute z-20 mt-1 max-h-80 w-full overflow-y-auto rounded border border-[#aaa99e] bg-white shadow-lg">
        {matches.map(person => <li key={person.id} id={`${listId}-${person.id}`} role="option" aria-selected={person.id === value}
          onMouseDown={event => event.preventDefault()} onClick={() => choose(person)} onPointerMove={() => setActiveId(person.id)}
          className={`min-h-12 cursor-pointer break-words border-b border-[#e4dfd5] px-3 py-3 last:border-0 ${person.id === activeId ? "bg-[#e1e9e2]" : "hover:bg-[#f0f3ec]"}`}>
          <span className="block text-sm font-semibold">{person.preferred_name}</span>
          <span className="mt-1 block text-xs leading-5 text-[#4f625f]">{personDetails(person) || "Life dates and birthplace not recorded"}</span>
          {person.short_bio && <span className="mt-1 line-clamp-2 text-xs leading-5 text-[#4f625f]">{person.short_bio}</span>}
          <span className="mt-1 block text-xs capitalize text-[#4f625f]">{person.status} · {person.living_status}</span>
        </li>)}
      </ul>}
    </div>
    <p id={statusId} role="status" aria-live="polite" className="mt-2 text-xs leading-5 text-[#4f625f]">
      {invalid && !valid ? "Choose a person from the suggestions before saving." : loading ? "Loading people…" : failed ? "People could not be refreshed. Use Retry loading people." : expanded ? matches.length ? `${matches.length} matching ${matches.length === 1 ? "person" : "people"}. Choose a suggestion. You can also search by year or birthplace.` : "No matching people. Try another name, or create a new profile." : valid ? "Profile selected. Edit the name to search again." : "Type a name, then choose a person from the suggestions."}
    </p>
    {selected && <div className="mt-2 rounded border border-[#cad7cd] bg-[#edf1ec] p-3 text-sm">
      <p className="break-words font-semibold">{selected.preferred_name}</p>
      <p className="mt-1 break-words text-xs leading-5 text-[#4f625f]">{personDetails(selected) || "Life dates and birthplace not recorded"}</p>
      {selected.short_bio && <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-[#4f625f]">{selected.short_bio}</p>}
      <div className="mt-2 flex flex-wrap gap-x-4">
        <a href={`/admin/family-members/${selected.id}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-xs font-semibold underline">View profile in new tab</a>
        <button type="button" disabled={disabled} onClick={() => { onChange(""); setQuery(""); setActiveId(null); setInvalid(false); setOpen(true); input.current?.focus(); }} className="min-h-11 text-xs font-semibold underline disabled:opacity-60">Clear {label.toLowerCase()}</button>
      </div>
    </div>}
  </div>;
}
