"use client";

import { useEffect, useState } from "react";
import { useController, type Control } from "react-hook-form";
import type { EditorValues, Field } from "@/lib/admin-config";

const inputClass = "mt-2 w-full rounded border border-[#aaa99e] bg-white px-3 py-3 outline-none focus:border-[#163e3a]";
const customOption = "__new_place__";
const label = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function ChoiceField({ config, control }: { config: Field; control: Control<EditorValues> }) {
  const { field: { value: fieldValue, name, onBlur, onChange, ref } } = useController({ name: config.key, control, rules: { required: config.required } });
  const [savedOptions, setSavedOptions] = useState<string[]>([]);
  const [optionsFailed, setOptionsFailed] = useState(false);
  const [custom, setCustom] = useState(false);
  const multiple = config.type === "tags";
  const selected = Array.isArray(fieldValue) ? fieldValue : [];
  const value = typeof fieldValue === "string" ? fieldValue : "";
  // Keep old values selectable even if the suggested vocabulary changes.
  const options = [...new Set([
    ...(config.options ?? []), ...savedOptions, ...(multiple ? selected : value ? [value] : []),
  ])];

  useEffect(() => {
    if (!config.optionsUrl) return;
    const controller = new AbortController();
    const url = config.optionsUrl;
    async function load() {
      const saved: string[] = [];
      for (let page = 1; ; page++) {
        const response = await fetch(`${url}?page=${page}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw Error("Could not load saved choices");
        const result = await response.json();
        saved.push(...result.data);
        if (!result.pagination?.hasMore) break;
      }
      setSavedOptions([...new Set(saved)].sort((a, b) => a.localeCompare(b)));
    }
    load().catch(() => { if (!controller.signal.aborted) setOptionsFailed(true); });
    return () => controller.abort();
  }, [config.optionsUrl]);

  function choose(next: string) {
    if (multiple) {
      if (next && selected.length < 20 && !selected.includes(next)) onChange([...selected, next]);
    } else if (config.customLabel && next === customOption) {
      setCustom(true);
      onChange("");
    } else {
      setCustom(false);
      onChange(next);
    }
  }

  return <>
    <select id={config.key} name={name} ref={ref} onBlur={onBlur}
      disabled={multiple && selected.length >= 20}
      aria-describedby={config.help ? `${config.key}-help` : undefined}
      value={multiple ? "" : custom ? customOption : value}
      onChange={event => choose(event.target.value)} className={inputClass}>
      {config.placeholder && <option value="">{config.placeholder}</option>}
      {options.filter(option => !multiple || !selected.includes(option)).map(option =>
        <option key={option} value={option}>{label(option)}</option>)}
      {config.customLabel && <option value={customOption}>{config.customLabel}…</option>}
    </select>
    {multiple && <ul aria-label="Selected linguistic tags" className="mt-3 flex flex-wrap gap-2">
      {selected.map(tag => <li key={tag} className="flex max-w-full items-center gap-2 rounded border border-[#cad7cd] bg-[#edf1ec] pl-3 text-sm">
        <span className="break-words">{label(tag)}</span>
        <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(selected.filter(value => value !== tag))}
          className="min-h-11 min-w-11 shrink-0 rounded font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">×</button>
      </li>)}
    </ul>}
    {multiple && selected.length >= 20 && <p role="status" className="mt-2 text-xs text-[#4f625f]">The limit is 20 tags. Remove a tag before adding another.</p>}
    {custom && <div className="mt-3">
      <label htmlFor={`${config.key}-custom`} className="block text-sm font-semibold">{config.customLabel}</label>
      <input id={`${config.key}-custom`} value={value} maxLength={300} onChange={event => onChange(event.target.value)}
        onBlur={onBlur} className={inputClass} />
      <p className="mt-1 text-xs leading-5 text-[#4f625f]">This place will be available in the list after you save the profile.</p>
    </div>}
    {optionsFailed && <p role="status" className="mt-2 text-xs leading-5 text-[#4f625f]">
      Saved places could not be loaded. Choose a listed place or use Other place.
    </p>}
  </>;
}
