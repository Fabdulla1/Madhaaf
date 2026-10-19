"use client";

import { useCallback, useEffect, useState } from "react";
import { MediaAttachment } from "./media-manager";

type WrittenForm = { id: string; spelling: string; is_preferred: boolean; note?: string };
type Sense = { id: string; gloss_en: string; definition_en?: string; display_order: number };
type Example = { id: string; sense_id: string; kutchi_text: string; english_translation?: string; display_order: number };

function ChildControls({resource,id,fields,onDone}:{resource:"spellings"|"senses"|"examples";id:string;fields:{key:string;label:string;value:string}[];onDone:()=>void}) {
  const [editing,setEditing]=useState(false);
  const [values,setValues]=useState<Record<string,string>>(Object.fromEntries(fields.map(f=>[f.key,f.value])));
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function update(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const response=await fetch(`/api/admin/${resource}/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});const result=await response.json();if(!response.ok)throw Error(result.error||"Edit failed");setEditing(false);onDone()}catch(cause){setError(cause instanceof Error?cause.message:"Edit failed")}finally{setBusy(false)}}
  async function remove(){if(!window.confirm("Remove this record? This cannot be recovered from the editor."))return;setBusy(true);setError("");try{const response=await fetch(`/api/admin/${resource}/${id}`,{method:"DELETE"});const result=await response.json();if(!response.ok)throw Error(result.error||"Remove failed");onDone()}catch(cause){setError(cause instanceof Error?cause.message:"Remove failed")}finally{setBusy(false)}}
  return <div className="mt-2 text-xs font-semibold"><div className="flex gap-3"><button type="button" onClick={()=>setEditing(!editing)} className="underline">{editing?"Cancel edit":"Edit"}</button><button type="button" onClick={remove} disabled={busy} className="text-[#9a2e2e] underline">Remove</button></div>{error&&<p role="alert" className="mt-2 font-normal text-[#9a2e2e]">{error}</p>}{editing&&<form onSubmit={update} className="mt-3 grid gap-2">{fields.map(f=><label key={f.key}>{f.label}<input required={f.key==="spelling"||f.key==="gloss_en"||f.key==="kutchi_text"} value={values[f.key]??""} onChange={e=>setValues({...values,[f.key]:e.target.value})} className="mt-1 w-full rounded border border-[#aaa99e] bg-white p-2 font-normal"/></label>)}<button disabled={busy} className="min-h-9 justify-self-start rounded bg-[#163e3a] px-3 text-white">Save edit</button></form>}</div>;
}

export function DictionaryDetails({lexemeId,status}:{lexemeId:string;status:string}) {
  const locked=status==="published";
  const [forms,setForms]=useState<WrittenForm[]>([]);
  const [senses,setSenses]=useState<Sense[]>([]);
  const [examples,setExamples]=useState<Example[]>([]);
  const [spelling,setSpelling]=useState("");
  const [gloss,setGloss]=useState("");
  const [definition,setDefinition]=useState("");
  const [selectedSense,setSelectedSense]=useState("");
  const [kutchi,setKutchi]=useState("");
  const [english,setEnglish]=useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const load=useCallback(async()=>{try{
    const [fr,sr]=await Promise.all([fetch(`/api/admin/spellings?lexeme_id=${lexemeId}`),fetch(`/api/admin/senses?lexeme_id=${lexemeId}`)]);
    const [fj,sj]=await Promise.all([fr.json(),sr.json()]);
    if(!fr.ok||!sr.ok)throw Error(fj.error||sj.error||"Could not load entry details");
    setForms(fj.data||[]);setSenses(sj.data||[]);
    const results=await Promise.all((sj.data||[]).map(async(s:Sense)=>{const r=await fetch(`/api/admin/examples?sense_id=${s.id}`);const j=await r.json();return r.ok?j.data||[]:[]}));
    setExamples(results.flat());
  }catch(cause){setError(cause instanceof Error?cause.message:"Could not load details")}},[lexemeId]);
  useEffect(()=>{load()},[load]);
  async function create(resource:string,payload:Record<string,unknown>,clear:()=>void){setBusy(true);setError("");setMessage("");try{const r=await fetch(`/api/admin/${resource}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const j=await r.json();if(!r.ok)throw Error(j.error||"Could not save");clear();setMessage("Saved to this entry.");await load()}catch(cause){setError(cause instanceof Error?cause.message:"Could not save")}finally{setBusy(false)}}
  return <section className="mt-14 border-t border-[#d8d3c8] pt-9">
    <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a533e]">Entry structure</p><h2 className="mt-2 font-serif text-3xl">Spellings, meanings, and examples</h2><p className="mt-3 leading-7 text-[#4f625f]">Each example belongs to a meaning. Spellings are stored separately so the permanent entry link survives changes to the preferred form.</p></div>
    {locked&&<p className="mt-5 rounded border border-[#b7674e] bg-[#fff5ec] p-4 text-sm">Unpublish this entry before editing spellings, meanings, examples, or recordings. This prevents unreviewed changes from appearing in public search.</p>}
    {error&&<p role="alert" className="mt-5 text-[#9a2e2e]">{error}</p>}{message&&<p role="status" className="mt-5 text-[#256b45]">{message}</p>}
    <div className="mt-8 grid gap-6 xl:grid-cols-3">
      <div className="border border-[#d8d3c8] bg-[#fffcf6] p-5"><h3 className="font-serif text-2xl">Written forms</h3><ul className="mt-4 space-y-3">{forms.map(f=><li key={f.id} className="border-b border-[#e1dfd7] pb-3"><strong>{f.spelling}</strong>{f.is_preferred&&<span className="ml-2 text-xs text-[#4f625f]">Preferred</span>}{!locked&&!f.is_preferred&&<ChildControls resource="spellings" id={f.id} fields={[{key:"spelling",label:"Spelling",value:f.spelling},{key:"note",label:"Note",value:f.note||""}]} onDone={load}/>}</li>)}</ul>{!locked&&<form onSubmit={e=>{e.preventDefault();create("spellings",{lexeme_id:lexemeId,spelling},()=>setSpelling(""))}} className="mt-5"><label className="text-sm font-semibold">Add spelling variant<input required value={spelling} onChange={e=>setSpelling(e.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] p-3"/></label><button disabled={busy} className="mt-3 min-h-10 rounded bg-[#163e3a] px-4 font-semibold text-white">Add spelling</button></form>}</div>
      <div className="border border-[#d8d3c8] bg-[#fffcf6] p-5"><h3 className="font-serif text-2xl">Meanings</h3><ul className="mt-4 space-y-3">{senses.map(s=><li key={s.id} className="border-b border-[#e1dfd7] pb-3"><strong>{s.gloss_en}</strong>{s.definition_en&&<p className="mt-1 text-sm text-[#4f625f]">{s.definition_en}</p>}{!locked&&<ChildControls resource="senses" id={s.id} fields={[{key:"gloss_en",label:"English meaning",value:s.gloss_en},{key:"definition_en",label:"Definition",value:s.definition_en||""}]} onDone={load}/>}</li>)}</ul>{!locked&&<form onSubmit={e=>{e.preventDefault();create("senses",{lexeme_id:lexemeId,gloss_en:gloss,definition_en:definition||null,display_order:Math.max(-1,...senses.map(s=>s.display_order))+1},()=>{setGloss("");setDefinition("")})}} className="mt-5 grid gap-3"><label className="text-sm font-semibold">English meaning<input required value={gloss} onChange={e=>setGloss(e.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] p-3"/></label><label className="text-sm font-semibold">Definition or nuance<textarea value={definition} onChange={e=>setDefinition(e.target.value)} rows={2} className="mt-2 w-full rounded border border-[#aaa99e] p-3"/></label><button disabled={busy} className="min-h-10 justify-self-start rounded bg-[#163e3a] px-4 font-semibold text-white">Add meaning</button></form>}</div>
      <div className="border border-[#d8d3c8] bg-[#fffcf6] p-5"><h3 className="font-serif text-2xl">Examples</h3><ul className="mt-4 space-y-3">{examples.map(ex=><li key={ex.id} className="border-b border-[#e1dfd7] pb-3"><strong>{ex.kutchi_text}</strong>{ex.english_translation&&<p className="mt-1 text-sm text-[#4f625f]">{ex.english_translation}</p>}{!locked&&<ChildControls resource="examples" id={ex.id} fields={[{key:"kutchi_text",label:"Kutchi sentence",value:ex.kutchi_text},{key:"english_translation",label:"English translation",value:ex.english_translation||""}]} onDone={load}/>}<MediaAttachment kind="example_media" ownerId={ex.id} disabled={locked}/></li>)}</ul>{!locked&&<form onSubmit={e=>{e.preventDefault();create("examples",{sense_id:selectedSense,kutchi_text:kutchi,english_translation:english||null,display_order:Math.max(-1,...examples.filter(ex=>ex.sense_id===selectedSense).map(ex=>ex.display_order))+1},()=>{setKutchi("");setEnglish("")})}} className="mt-5 grid gap-3"><label className="text-sm font-semibold">Meaning<select required value={selectedSense} onChange={e=>setSelectedSense(e.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3"><option value="">Choose meaning</option>{senses.map(s=><option key={s.id} value={s.id}>{s.gloss_en}</option>)}</select></label><label className="text-sm font-semibold">Kutchi sentence<input required value={kutchi} onChange={e=>setKutchi(e.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] p-3"/></label><label className="text-sm font-semibold">English translation<input value={english} onChange={e=>setEnglish(e.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] p-3"/></label><button disabled={busy||!senses.length} className="min-h-10 justify-self-start rounded bg-[#163e3a] px-4 font-semibold text-white disabled:opacity-50">Add example</button></form>}</div>
    </div><div className="max-w-xl"><MediaAttachment kind="lexeme_media" ownerId={lexemeId} purpose="pronunciation" disabled={locked}/></div>
  </section>;
}
