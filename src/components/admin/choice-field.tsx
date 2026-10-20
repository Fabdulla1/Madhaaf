"use client";

import { useController, type Control } from "react-hook-form";
import type { EditorValues, Field } from "@/lib/admin-config";

const inputClass = "mt-2 w-full rounded border border-[#aaa99e] bg-white px-3 py-3 outline-none focus:border-[#163e3a]";
const label = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function ChoiceField({ config, control }: { config: Field; control: Control<EditorValues> }) {
  const { field: { value: fieldValue, name, onBlur, onChange, ref } } = useController({ name: config.key, control, rules: { required: config.required } });
  const multiple = config.type === "tags";
  const selected = Array.isArray(fieldValue) ? fieldValue : [];
  const value = typeof fieldValue === "string" ? fieldValue : "";
  // Keep old values selectable even if the suggested vocabulary changes.
  const options = [...new Set([
    ...(config.options ?? []), ...(multiple ? selected : value ? [value] : []),
  ])];

  function choose(next: string) {
    if (multiple) {
      if (next && selected.length < 20 && !selected.includes(next)) onChange([...selected, next]);
    } else {
      onChange(next);
    }
  }

  return <>
    <select id={config.key} name={name} ref={ref} onBlur={onBlur}
      disabled={multiple && selected.length >= 20}
      aria-describedby={config.help ? `${config.key}-help` : undefined}
      value={multiple ? "" : value}
      onChange={event => choose(event.target.value)} className={inputClass}>
      {config.placeholder && <option value="">{config.placeholder}</option>}
      {options.filter(option => !multiple || !selected.includes(option)).map(option =>
        <option key={option} value={option}>{label(option)}</option>)}
    </select>
    {multiple && <ul aria-label="Selected linguistic tags" className="mt-3 flex flex-wrap gap-2">
      {selected.map(tag => <li key={tag} className="flex max-w-full items-center gap-2 rounded border border-[#cad7cd] bg-[#edf1ec] pl-3 text-sm">
        <span className="break-words">{label(tag)}</span>
        <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(selected.filter(value => value !== tag))}
          className="min-h-11 min-w-11 shrink-0 rounded font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">×</button>
      </li>)}
    </ul>}
    {multiple && selected.length >= 20 && <p role="status" className="mt-2 text-xs text-[#4f625f]">The limit is 20 tags. Remove a tag before adding another.</p>}
  </>;
}
