"use client";

import { useController, type Control } from "react-hook-form";
import { useState } from "react";
import type { EditorValues, Field } from "@/lib/admin-config";
import { daysInMonth, monthNames, parseFamilyDate, serializeFamilyDate, validateFamilyDate, type DateParts, type DatePrecision } from "@/lib/family-dates";

const inputClass = "mt-2 w-full min-w-0 rounded border border-[#aaa99e] bg-white px-3 py-3 outline-none focus:border-[#163e3a]";
// All four-digit CE years can be typed and selected, including older family records.
const years = Array.from({ length: 9999 }, (_, index) => String(9999 - index).padStart(4, "0"));

export function DateField({ config, control }: { config: Field; control: Control<EditorValues> }) {
  const { field: { value: raw, onChange, onBlur, ref }, fieldState } = useController({
    name: config.key, control,
    rules: { validate: value => validateFamilyDate(typeof value === "string" ? value : "") },
  });
  const value = typeof raw === "string" ? raw : "";
  // The editor remounts this field when a saved record/revision is loaded.
  // Keep partial input locally so typing "1" doesn't turn the input into "0001".
  const [parts, setParts] = useState(() => ({ ...parseFamilyDate(value), text: value }));
  const precision = parts.precision;
  const prefix = config.key === "birth_date_text" ? "Birth" : "Death";
  const errorId = `${config.key}-error`;
  const describedBy = [config.help && `${config.key}-help`, fieldState.error && errorId].filter(Boolean).join(" ") || undefined;
  function changePrecision(next: DatePrecision) {
    const updated = { ...parts, precision: next, text: value.includes("?") ? "" : value };
    setParts(updated);
    onChange(next === "text" ? updated.text : serializeFamilyDate(updated));
  }
  function changePart(key: "year" | "month" | "day", next: string) {
    const updated: DateParts = { ...parts, [key]: next };
    if (key !== "day" && Number(updated.day) > daysInMonth(updated.year, updated.month)) updated.day = "";
    setParts({ ...updated, text: parts.text });
    onChange(serializeFamilyDate(updated));
  }
  // Keep the list small while allowing any year through typing; recent years
  // are offered first when the year is blank.
  const currentYear = new Date().getUTCFullYear();
  const yearChoices = (parts.year ? years.filter(year => year.startsWith(parts.year)) : years.filter(year => Number(year) <= currentYear)).slice(0, 150);
  return <div>
    <select id={config.key} ref={ref} value={precision} onBlur={onBlur} aria-describedby={describedBy}
      onChange={event => changePrecision(event.target.value as DatePrecision)} className={inputClass}>
      <option value="unknown">Not recorded</option><option value="day">Full date</option>
      <option value="month">Month and year</option><option value="year">Year only</option>
      <option value="text">Approximate or historical date</option>
    </select>
    {precision !== "unknown" && precision !== "text" && <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="min-w-0 text-sm font-semibold"><label htmlFor={`${config.key}-year`}>{prefix} year</label>
        <input id={`${config.key}-year`} value={parts.year} inputMode="numeric" maxLength={4} list={`${config.key}-years`} placeholder="YYYY"
          aria-invalid={Boolean(fieldState.error)} aria-describedby={describedBy} onBlur={onBlur}
          onChange={event => { const next = event.target.value.replace(/\D/g, ""); changePart("year", next); }} className={inputClass}/>
        <datalist id={`${config.key}-years`}>{yearChoices.map(year => <option key={year} value={year}/>)}</datalist>
      </div>
      {(precision === "month" || precision === "day") && <div className="min-w-0 text-sm font-semibold"><label htmlFor={`${config.key}-month`}>{prefix} month</label>
        <select id={`${config.key}-month`} value={parts.month} onBlur={onBlur} aria-invalid={Boolean(fieldState.error)} aria-describedby={describedBy} onChange={event => changePart("month", event.target.value)} className={inputClass}>
          <option value="">Choose month</option>{monthNames.map((month, index) => <option key={month} value={String(index + 1).padStart(2, "0")}>{month}</option>)}
        </select>
      </div>}
      {precision === "day" && <div className="min-w-0 text-sm font-semibold"><label htmlFor={`${config.key}-day`}>{prefix} day</label>
        <select id={`${config.key}-day`} value={parts.day} onBlur={onBlur} aria-invalid={Boolean(fieldState.error)} aria-describedby={describedBy} onChange={event => changePart("day", event.target.value)} className={inputClass}>
          <option value="">Choose day</option>{Array.from({ length: daysInMonth(parts.year, parts.month) }, (_, index) => <option key={index} value={String(index + 1).padStart(2, "0")}>{index + 1}</option>)}
        </select>
      </div>}
    </div>}
    {precision === "text" && <label className="mt-3 block text-sm font-semibold">{prefix} date or period
      <input value={parts.text} maxLength={100} onBlur={onBlur} placeholder="For example: around 1900 or before 1885"
        onChange={event => { setParts({ ...parts, text: event.target.value }); onChange(event.target.value); }} className={inputClass}/>
    </label>}
  </div>;
}
