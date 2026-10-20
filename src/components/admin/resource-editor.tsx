"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { EditorValues, ResourceConfig } from "@/lib/admin-config";
import { DictionaryDetails } from "./dictionary-details";
import { MediaAttachment } from "./media-manager";
import { RevisionHistory } from "./revision-history";
import { MarkdownContent } from "@/components/public/markdown";
import { ReferencesEditor } from "./references-editor";
import { WritingReference } from "@/components/letter-reference";
import { ChoiceField } from "./choice-field";

type RecordData = Record<string, unknown>;
const fieldClass="mt-2 w-full rounded border border-[#aaa99e] bg-white px-3 py-3 outline-none focus:border-[#163e3a]";
const textValue=(value:string|string[]|undefined)=>typeof value==="string"?value:"";
const valuesFor=(config:ResourceConfig,record:RecordData={}):EditorValues=>Object.fromEntries(config.fields.map(field=>{
  const value=record[field.key];
  return [field.key,field.type==="tags"
    ? Array.isArray(value) ? value.filter((tag):tag is string=>typeof tag==="string") : []
    : String(value??field.defaultValue??"")];
}));

export function ResourceEditor({section,id,config}:{section:string;id:string;config:ResourceConfig}) {
  const router=useRouter(); const isNew=id==="new";
  const [record,setRecord]=useState<RecordData|null>(null);
  const contentLocked=(section==="dictionary"||section==="history") && record?.status==="published";
  const [preview,setPreview]=useState(false);
  const [error,setError]=useState(""); const [success,setSuccess]=useState(""); const [busy,setBusy]=useState(false); const [loading,setLoading]=useState(!isNew);
  const {register,reset,getValues,control,trigger,formState:{isDirty,errors}}=useForm<EditorValues>({defaultValues:valuesFor(config)});
  const previewTitle=textValue(useWatch({control,name:"title"}));
  const previewSummary=textValue(useWatch({control,name:"summary"}));
  const previewBody=textValue(useWatch({control,name:"body_markdown"}));
  useEffect(()=>{if(isNew)return;fetch(`/api/admin/${config.api}/${id}`).then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error||"Could not load record");setRecord(j.data);reset(valuesFor(config,j.data))}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[id,isNew,config,reset]);
  useEffect(()=>{function guard(e:BeforeUnloadEvent){if(isDirty){e.preventDefault()}}window.addEventListener("beforeunload",guard);return()=>window.removeEventListener("beforeunload",guard)},[isDirty]);
  async function save(nextStatus?:string) {
    if(!(await trigger()))return;
    setBusy(true);setError("");setSuccess("");
    const values=getValues(); const payload:RecordData={};
    for(const f of config.fields){const value=textValue(values[f.key]).trim();if(f.type==="tags")payload[f.key]=Array.isArray(values[f.key])?values[f.key]:[];else if(value)payload[f.key]=value;else if(!isNew)payload[f.key]=f.key==="body_markdown"?"":null}
    if(isNew&&section==="dictionary"){
      const firstEntry={...payload,gloss_en:textValue(values.gloss_en).trim(),definition_en:textValue(values.definition_en).trim()||undefined,kutchi_text:textValue(values.kutchi_text).trim()||undefined,english_translation:textValue(values.english_translation).trim()||undefined};
      try{
        const response=await fetch("/api/admin/dictionary-entry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(firstEntry)});
        const result=await response.json();
        if(!response.ok)throw Error(result.error||"Could not create dictionary entry");
        setSuccess("Draft created with its first meaning and example.");
        router.replace(`/admin/dictionary/${result.data.id}`);router.refresh();
      }catch(cause){setError(cause instanceof Error?cause.message:"Could not create dictionary entry")}finally{setBusy(false)}
      return;
    }
    if(isNew){if(!["categories","sources"].includes(section))payload.status=nextStatus??"draft"}
    else {payload.version=record?.version; if(nextStatus && !["categories","sources"].includes(section))payload.status=nextStatus}
    if(section==="history" && nextStatus==="published")payload.published_at=new Date().toISOString();
    try {const response=await fetch(`/api/admin/${config.api}${isNew?"":`/${id}`}`,{method:isNew?"POST":"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const j=await response.json();if(!response.ok)throw Error(j.error||"Save failed");setRecord(j.data);reset(valuesFor(config,j.data));setSuccess(nextStatus==="published"?"Published successfully.":"Saved successfully.");if(isNew)router.replace(`/admin/${section}/${j.data.id}`);router.refresh()}catch(e){setError(e instanceof Error?e.message:"Save failed") }finally{setBusy(false)}
  }
  async function archive(){if(!record || !window.confirm(`Archive this ${config.singular.toLowerCase()}? It will be removed from published views.`))return;setBusy(true);setError("");try{const response=await fetch(`/api/admin/${config.api}/${id}`,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({version:record.version})});const j=await response.json();if(!response.ok)throw Error(j.error||"Archive failed");setRecord(j.data);setSuccess("Archived successfully.")}catch(e){setError(e instanceof Error?e.message:"Archive failed")}finally{setBusy(false)}}
  async function unpublish(){if(!record)return;setBusy(true);setError("");setSuccess("");try{const response=await fetch(`/api/admin/${config.api}/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({version:record.version,status:"draft"})});const j=await response.json();if(!response.ok)throw Error(j.error||"Could not unpublish");setRecord(j.data);reset(valuesFor(config,j.data));setSuccess("Unpublished. You can now revise the draft.")}catch(e){setError(e instanceof Error?e.message:"Could not unpublish")}finally{setBusy(false)}}
  if(loading)return <p>Loading entry…</p>;
  return <><Link href={`/admin/${section}`} className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16}/> Back to {config.title.toLowerCase()}</Link><div className="mt-7 flex flex-wrap items-start justify-between gap-4 border-b border-[#d8d3c8] pb-7"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a533e]">{isNew?"New entry":"Edit entry"}</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">{isNew?`Add ${config.singular.toLowerCase()}`:String(record?.[config.label]??config.singular)}</h1><p className="mt-3 text-sm text-[#4f625f]">{record ? `Status: ${String(record.status??"entry")} · Version ${String(record.version??"—")}` : "New entries begin as drafts."}</p></div>{record && config.publicPath && config.publicPathKey && Boolean(record[config.publicPathKey]) && record.status==="published" && <Link href={`${config.publicPath}${encodeURIComponent(String(record[config.publicPathKey]))}`} target="_blank" className="inline-flex items-center gap-2 border-b border-current pb-1 font-semibold">Open published page <ExternalLink size={16}/></Link>}</div>
  {error && <p role="alert" className="mt-6 rounded border border-[#9a2e2e] bg-[#fff5f0] p-4 text-[#9a2e2e]">{error}{error.includes("changed since") && " Refresh the page to review the latest version before retrying."}</p>}{success && <p role="status" className="mt-6 rounded border border-[#256b45] bg-[#ecf5e9] p-4 text-[#256b45]">{success}</p>}
  <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,760px)_minmax(220px,1fr)]"><form onSubmit={e=>e.preventDefault()} className="space-y-6"><div className="border border-[#d8d3c8] bg-[#fffcf6] p-5 sm:p-8"><h2 className="font-serif text-2xl">Details</h2>{contentLocked&&<p className="mt-3 rounded border border-[#b7674e] p-3 text-sm">Unpublish this {section==="dictionary"?"dictionary entry":"article"} before editing its content.</p>}<fieldset disabled={contentLocked} className="mt-6 grid gap-5 disabled:opacity-60">{config.fields.map(field=><div key={field.key}><label htmlFor={field.key} className="block text-sm font-semibold">{field.label}{field.required && <span aria-hidden="true"> *</span>}</label>{field.help && <p id={`${field.key}-help`} className="mt-1 text-xs leading-5 text-[#4f625f]">{field.help}</p>}{field.type==="textarea"?<textarea id={field.key} rows={field.key==="body_markdown"||field.key==="biography"?12:4} aria-describedby={field.help?`${field.key}-help`:undefined} {...register(field.key,{required:field.required})} className={fieldClass}/>:(field.type==="select"||field.type==="tags")?<ChoiceField config={field} control={control}/>:<input id={field.key} aria-describedby={field.help?`${field.key}-help`:undefined} {...register(field.key,{required:field.required})} className={fieldClass}/>} {errors[field.key] && <p className="mt-1 text-sm text-[#9a2e2e]">This field is required.</p>}{section==="dictionary" && field.key==="headword" && <WritingReference/>}</div>)}</fieldset></div>
    {isNew&&section==="dictionary"&&<div className="border border-[#d8d3c8] bg-[#fffcf6] p-5 sm:p-8"><h2 className="font-serif text-2xl">First meaning and example</h2><p className="mt-2 text-sm text-[#4f625f]">Add an English meaning and definition now. A Kutchi sentence and its translation are optional; you can add more later.</p><div className="mt-6 grid gap-5"><div><label htmlFor="gloss_en" className="block text-sm font-semibold">English meaning <span aria-hidden="true">*</span></label><input id="gloss_en" {...register("gloss_en",{required:true})} className={fieldClass}/>{errors.gloss_en&&<p className="mt-1 text-sm text-[#9a2e2e]">English meaning is required.</p>}</div><div><label htmlFor="definition_en" className="block text-sm font-semibold">Definition or nuance</label><textarea id="definition_en" rows={3} {...register("definition_en")} className={fieldClass}/></div><div><label htmlFor="kutchi_text" className="block text-sm font-semibold">Use in a Kutchi sentence</label><textarea id="kutchi_text" rows={2} {...register("kutchi_text")} className={fieldClass}/><WritingReference/></div><div><label htmlFor="english_translation" className="block text-sm font-semibold">English translation of the sentence</label><textarea id="english_translation" rows={2} {...register("english_translation")} className={fieldClass}/></div></div></div>}
    <div className="flex flex-wrap gap-3">{!contentLocked&&<button type="button" disabled={busy} onClick={()=>save(record?.status==="published"?undefined:"draft")} className="min-h-12 rounded border border-[#163e3a] px-5 font-semibold disabled:opacity-50">{busy?"Saving…":record?.status==="published"?"Save changes":"Save draft"}</button>}{(section==="history"||section==="orthography")&&<button type="button" onClick={()=>setPreview(!preview)} className="min-h-12 rounded border border-[#163e3a] px-5 font-semibold">{preview?"Hide preview":"Preview"}</button>}{!contentLocked && !(isNew&&section==="dictionary") && !["categories","sources"].includes(section)&&<button type="button" disabled={busy} onClick={()=>save("published")} className="min-h-12 rounded bg-[#163e3a] px-5 font-semibold text-white disabled:opacity-50">Publish</button>}{record?.status==="published" && <button type="button" disabled={busy} onClick={unpublish} className="min-h-12 rounded border border-[#b7674e] px-5 font-semibold">Unpublish</button>}{record && record.status!=="archived" && !["categories","sources"].includes(section) && <button type="button" disabled={busy} onClick={archive} className="min-h-12 px-4 font-semibold text-[#9a2e2e] underline">Archive</button>}</div>
    </form><aside className="self-start border-t border-[#d8d3c8] pt-5 text-sm leading-6 text-[#4f625f]"><h2 className="font-serif text-xl text-[#163e3a]">Editorial note</h2><p className="mt-3">Only publish material you have permission and evidence to share. For the public family tree, each person must be Published, Public, and Deceased; connections must also be Published, and public sharing must be on in Settings. Private notes and media stay restricted.</p>{section==="dictionary" && <p className="mt-4">Use the letter references beside the Kutchi fields while writing. Preserve apostrophes, vowel marks, and (n) exactly as written.</p>}</aside></div>
  {preview&&(section==="history"||section==="orthography")&&<section aria-label="Draft preview" className="mt-10 max-w-3xl border border-[#d8d3c8] bg-[#fffcf6] p-6 sm:p-10"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a533e]">Unpublished preview</p><h2 className="mt-5 font-serif text-4xl">{previewTitle||"Untitled"}</h2>{section==="history"&&<p className="mt-4 text-lg text-[#4f625f]">{previewSummary}</p>}<div className="mt-7"><MarkdownContent content={previewBody||""}/></div></section>}
  {section==="dictionary" && record && <DictionaryDetails lexemeId={String(record.id)} status={String(record.status)}/>}
  {section==="family-members" && record && <div className="max-w-xl"><MediaAttachment kind="member_media" ownerId={String(record.id)}/></div>}
  {section==="family-members" && record && <div className="max-w-xl"><ReferencesEditor kind="member_sources" ownerId={String(record.id)}/></div>}
  {section==="history" && record && <div className="grid gap-6 xl:grid-cols-2"><MediaAttachment kind="article_media" ownerId={String(record.id)} disabled={record.status==="published"}/><ReferencesEditor kind="article_categories" ownerId={String(record.id)} disabled={record.status==="published"}/><ReferencesEditor kind="article_sources" ownerId={String(record.id)} disabled={record.status==="published"}/><ReferencesEditor kind="article_lexemes" ownerId={String(record.id)} disabled={record.status==="published"}/></div>}
  {record && ["family-members","dictionary","history","orthography"].includes(section) && <RevisionHistory resource={config.api} record={record} onRestore={restored=>{setRecord(restored);reset(valuesFor(config,restored));setSuccess("Revision restored.")}}/>}
  </>;
}
