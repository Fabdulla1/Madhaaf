"use client";

import { useCallback, useEffect, useState } from "react";

type Inflection = {
  id: string;
  written_form: string;
  grammatical_person: string | null;
  grammatical_number: string | null;
  gender: string | null;
  tense: string | null;
  aspect: string | null;
  mood: string | null;
  politeness: string | null;
  original_transcription: string | null;
  evidence_status: "attested" | "provisional";
  source_id: string | null;
  note: string | null;
};

type FormValues = Omit<Inflection, "id" | "source_id" | "evidence_status"> & {
  source_id: string;
  evidence_status: "attested" | "provisional";
};

const emptyForm: FormValues = {
  written_form: "", grammatical_person: null, grammatical_number: null,
  gender: null, tense: null, aspect: null, mood: null, politeness: null,
  original_transcription: null, evidence_status: "provisional", source_id: "", note: null,
};

const choices = {
  grammatical_person: ["first", "second", "third"],
  grammatical_number: ["singular", "plural"],
  gender: ["masculine", "feminine"],
  tense: ["present", "past", "future"],
  mood: ["indicative", "imperative"],
} as const;

async function loadPages<T>(resource: "inflections" | "sources", lexemeId?: string): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ page: String(page), limit: "200" });
    if (lexemeId) params.set("lexeme_id", lexemeId);
    const response = await fetch(`/api/admin/${resource}?${params}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw Error(result.error || `Could not load ${resource}`);
    all.push(...(result.data || []));
    if (!result.pagination?.hasMore) return all;
  }
}

function formPayload(values: FormValues, lexemeId: string) {
  return {
    lexeme_id: lexemeId,
    written_form: values.written_form.trim(),
    grammatical_person: values.grammatical_person || null,
    grammatical_number: values.grammatical_number || null,
    gender: values.gender || null,
    tense: values.tense || null,
    aspect: values.aspect?.trim() || null,
    mood: values.mood || null,
    politeness: values.politeness?.trim() || null,
    original_transcription: values.original_transcription?.trim() || null,
    evidence_status: values.evidence_status,
    source_id: values.source_id || null,
    note: values.note?.trim() || null,
  };
}

function InflectionForm({ initial, sources, busy, onSave, onCancel }: {
  initial: FormValues;
  sources: Array<{ id: string; title: string }>;
  busy: boolean;
  onSave: (values: FormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<FormValues>(initial);
  const set = (key: keyof FormValues, value: string) =>
    setValues(current => ({ ...current, [key]: value || null }));
  return <form onSubmit={event => { event.preventDefault(); void onSave(values); }} className="mt-4 grid gap-4 rounded border border-[#d8d3c8] bg-[#fffcf6] p-5 sm:grid-cols-2 lg:grid-cols-4">
    <label className="text-sm font-semibold">Recorded form
      <input required maxLength={200} value={values.written_form} onChange={event => set("written_form", event.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3" />
    </label>
    {Object.entries(choices).map(([key, options]) => <label key={key} className="text-sm font-semibold capitalize">{key.replace("grammatical_", "")}
      <select value={values[key as keyof FormValues] || ""} onChange={event => set(key as keyof FormValues, event.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3">
        <option value="">Unspecified</option>{options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>)}
    <label className="text-sm font-semibold">Aspect, if attested
      <input maxLength={100} value={values.aspect || ""} onChange={event => set("aspect", event.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3" />
    </label>
    <label className="text-sm font-semibold">Politeness, if attested
      <input maxLength={100} value={values.politeness || ""} onChange={event => set("politeness", event.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3" />
    </label>
    <label className="text-sm font-semibold">Speaker transcription
      <input maxLength={200} value={values.original_transcription || ""} onChange={event => set("original_transcription", event.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3" />
    </label>
    <label className="text-sm font-semibold">Evidence status
      <select value={values.evidence_status} onChange={event => set("evidence_status", event.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3">
        <option value="provisional">Provisional</option><option value="attested">Attested</option>
      </select>
    </label>
    <label className="text-sm font-semibold">Source
      <select value={values.source_id} onChange={event => set("source_id", event.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3">
        <option value="">No source selected</option>{sources.map(source => <option key={source.id} value={source.id}>{source.title}</option>)}
      </select>
    </label>
    <label className="text-sm font-semibold sm:col-span-2">Evidence or editorial note
      <textarea rows={2} value={values.note || ""} onChange={event => set("note", event.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3" />
    </label>
    <div className="flex items-end gap-4 sm:col-span-2 lg:col-span-4">
      <button disabled={busy} className="min-h-11 rounded bg-[#163e3a] px-5 font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save recorded form"}</button>
      {onCancel && <button type="button" onClick={onCancel} className="min-h-11 font-semibold underline">Cancel edit</button>}
    </div>
  </form>;
}

export function DictionaryInflections({ lexemeId, locked }: { lexemeId: string; locked: boolean }) {
  const [forms, setForms] = useState<Inflection[]>([]);
  const [sources, setSources] = useState<Array<{ id: string; title: string }>>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try {
      const [records, provenance] = await Promise.all([
        loadPages<Inflection>("inflections", lexemeId),
        loadPages<{ id: string; title: string }>("sources"),
      ]);
      setForms(records);
      setSources(provenance);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load recorded forms");
      return false;
    }
  }, [lexemeId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  async function save(values: FormValues, id?: string) {
    if (busy || locked) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const payload = formPayload(values, lexemeId);
      if (id) delete (payload as Partial<typeof payload>).lexeme_id;
      const response = await fetch(`/api/admin/inflections${id ? `/${id}` : ""}`, {
        method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not save recorded form");
      setEditing(null); setRevision(value => value + 1);
      if (await load()) setMessage("Recorded form saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save recorded form");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (busy || locked || !window.confirm("Remove this recorded form?")) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/inflections/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not remove recorded form");
      if (await load()) setMessage("Recorded form removed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not remove recorded form");
    } finally { setBusy(false); }
  }

  return <section className="mt-9 border-t border-[#d8d3c8] pt-7" aria-labelledby="recorded-forms-heading">
    <h3 id="recorded-forms-heading" className="font-serif text-2xl">Recorded inflections</h3>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4f625f]">Add only speaker-attested forms or mark uncertain analyses as provisional. A form belongs to this dictionary entry; it is separate from spelling variants.</p>
    {locked && <p className="mt-3 text-sm text-[#4f625f]">Move this entry to draft before changing recorded forms.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-[#9a2e2e]">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm text-[#256b45]">{message}</p>}
    <ul className="mt-5 divide-y divide-[#d8d3c8] border-t border-[#d8d3c8]">
      {forms.map(form => <li key={form.id} className="py-4">
        <p className="font-semibold">{form.written_form} <span className="ml-2 text-xs font-normal capitalize text-[#4f625f]">{[form.tense, form.mood, form.grammatical_person, form.grammatical_number, form.gender, form.aspect, form.politeness, form.evidence_status].filter(Boolean).join(" · ")}</span></p>
        {form.original_transcription && form.original_transcription !== form.written_form && <p className="mt-1 text-xs text-[#4f625f]">Speaker transcription: {form.original_transcription}</p>}
        {form.note && <p className="mt-1 text-sm text-[#4f625f]">{form.note}</p>}
        {!locked && <div className="mt-2 flex gap-4 text-sm font-semibold"><button type="button" onClick={() => setEditing(form.id)} className="min-h-11 underline">Edit</button><button type="button" disabled={busy} onClick={() => void remove(form.id)} className="min-h-11 text-[#9a2e2e] underline">Remove</button></div>}
        {editing === form.id && <InflectionForm key={form.id} initial={{ ...form, source_id: form.source_id || "" }} sources={sources} busy={busy} onSave={values => save(values, form.id)} onCancel={() => setEditing(null)} />}
      </li>)}
    </ul>
    {!locked && <><h4 className="mt-6 font-serif text-xl">Add a recorded form</h4><InflectionForm key={revision} initial={emptyForm} sources={sources} busy={busy} onSave={values => save(values)} /></>}
  </section>;
}
