"use client";

import { useEffect, useState } from "react";
import { useController, type Control } from "react-hook-form";
import type { EditorValues, Field } from "@/lib/admin-config";
import { normalizePlace, type LocationOption, type LocationResults } from "@/lib/locations";

const inputClass = "mt-2 w-full min-w-0 rounded border border-[#aaa99e] bg-white px-3 py-3 outline-none focus:border-[#163e3a]";
type SearchState = LocationResults & { query: string; kind: string; failed?: boolean };
const kindLabels = { country: "Country", state: "State / region", city: "City / town", saved: "Saved place" };

export function LocationField({ config, control }: { config: Field; control: Control<EditorValues> }) {
  const { field: { value: raw, onChange, onBlur, ref } } = useController({ name: config.key, control });
  const value = typeof raw === "string" ? raw : "";
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("all");
  const [active, setActive] = useState(-1);
  const [saved, setSaved] = useState<string[]>([]);
  const [result, setResult] = useState<SearchState | null>(null);
  const current = result?.query === value && result.kind === kind ? result : null;
  const listId = `${config.key}-options`;
  const queryTokens = normalizePlace(value).split(" ").filter(Boolean);
  const savedMatches: LocationOption[] = kind === "all" ? saved
    .filter(place => queryTokens.every(token => normalizePlace(place).includes(token)))
    .slice(0, 10).map(label => ({ id: `saved-${label}`, label, kind: "saved" })) : [];
  const options = [...savedMatches, ...(current?.data ?? []).filter(place => !savedMatches.some(saved => saved.label === place.label))];
  const activeOption = options[active];

  useEffect(() => {
    const controller = new AbortController();
    async function loadSaved() {
      const places: string[] = [];
      for (let page = 1; ; page++) {
        const response = await fetch(`/api/admin/birthplaces?page=${page}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json();
        places.push(...result.data);
        if (!result.pagination?.hasMore) break;
      }
      if (!controller.signal.aborted) { setSaved([...new Set(places)].sort((a, b) => a.localeCompare(b))); setActive(-1); }
    }
    void loadSaved().catch(() => { /* World search and manual entry remain available. */ });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: value.slice(0, 100), kind });
        const response = await fetch(`/api/admin/locations?${params}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw Error("Location search unavailable");
        const data: LocationResults = await response.json();
        if (!controller.signal.aborted) { setResult({ ...data, query: value, kind }); setActive(-1); }
      } catch {
        if (!controller.signal.aborted) { setResult({ data: [], hasMore: false, query: value, kind, failed: true }); setActive(-1); }
      }
    }, 200);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [value, kind, open]);

  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);

  function choose(option: LocationOption) { onChange(option.label); setOpen(false); setActive(-1); }

  return <div className="min-w-0">
    <label className="mt-3 block text-xs text-[#4f625f]" htmlFor={`${config.key}-kind`}>Search within</label>
    <select id={`${config.key}-kind`} value={kind} onChange={event => { setKind(event.target.value); setActive(-1); }} className={inputClass}>
      <option value="all">All places</option><option value="country">Countries</option>
      <option value="state">States and regions</option><option value="city">Cities and towns</option>
    </select>
    <div className="relative">
      <input id={config.key} ref={ref} role="combobox" aria-autocomplete="list" aria-expanded={open}
        aria-controls={open ? listId : undefined} aria-activedescendant={open && activeOption ? `${listId}-${active}` : undefined}
        aria-describedby={`${config.key}-help ${config.key}-status`} autoComplete="off" maxLength={300}
        value={value} placeholder="Type a city, state, or country"
        onFocus={() => { setOpen(true); setActive(-1); }}
        onBlur={() => { setOpen(false); setActive(-1); onBlur(); }}
        onChange={event => { onChange(event.target.value); setOpen(true); setActive(-1); }}
        onKeyDown={event => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true);
            setActive(index => options.length ? event.key === "ArrowDown" ? (index + 1) % options.length : (index <= 0 ? options.length - 1 : index - 1) : -1);
          } else if (event.key === "Enter" && open && activeOption) {
            event.preventDefault(); choose(activeOption);
          } else if (event.key === "Escape") { event.preventDefault(); setOpen(false); setActive(-1); }
        }} className={inputClass}/>
      {open && <ul id={listId} role="listbox" aria-label="Place suggestions" aria-busy={!current}
        className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded border border-[#aaa99e] bg-white shadow-lg">
        {options.map((option, index) => <li key={option.id} id={`${listId}-${index}`} role="option" aria-selected={index === active}
          onPointerDown={event => event.preventDefault()} onClick={() => choose(option)}
          onPointerMove={() => setActive(index)} className={`min-h-12 cursor-pointer break-words px-3 py-3 text-sm ${index === active ? "bg-[#e1e9e2]" : "hover:bg-[#f0f3ec]"}`}>
          <span className="block">{option.label}</span><span className="text-xs text-[#4f625f]">{kindLabels[option.kind]}</span>
        </li>)}
      </ul>}
    </div>
    <p id={`${config.key}-status`} role="status" aria-live="polite" className="mt-2 text-xs leading-5 text-[#4f625f]">
      {open && !current ? "Searching places…" : open && current?.failed ? "Location search is unavailable. You can still type and save a place." : open && options.length === 0 ? "No matching places. You can keep the place you typed, including historical names." : open && current?.hasMore ? "More matches are available. Type a more specific name or include the country." : "Choose a suggestion, or keep your own spelling. Leave blank when unknown."}
    </p>
    <p className="mt-2 text-xs text-[#4f625f]">Location data: <a href="https://github.com/dr5hn/countries-states-cities-database" target="_blank" rel="noreferrer" className="underline">Countries States Cities Database</a> (<a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer" className="underline">ODbL</a>).</p>
  </div>;
}
