"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import type { ResourceConfig } from "@/lib/admin-config";

export function ResourceList({section,config}:{section:string;config:ResourceConfig}) {
  const [rows,setRows]=useState<Record<string,unknown>[]>([]);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  const [q,setQ]=useState("");
  const [status,setStatus]=useState("all");
  const [page,setPage]=useState(1);
  const [total,setTotal]=useState(0);
  const [hasMore,setHasMore]=useState(false);
  useEffect(()=>{const controller=new AbortController();const timer=window.setTimeout(()=>{const params=new URLSearchParams({page:String(page),limit:"100"});if(q.trim())params.set("q",q.trim());if(status!=="all")params.set("status",status);fetch(`/api/admin/${config.api}?${params}`,{signal:controller.signal}).then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error||"Could not load entries");setRows(j.data||[]);setTotal(j.pagination?.total??(j.data||[]).length);setHasMore(Boolean(j.pagination?.hasMore))}).catch(e=>{if(e.name!=="AbortError")setError(e.message)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)})},q?200:0);return()=>{window.clearTimeout(timer);controller.abort()}},[config.api,page,q,status]);
  const filtered=rows;
  return <><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a533e]">Manage the archive</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">{config.title}</h1><p className="mt-3 text-[#4f625f]">{loading ? "Loading…" : `${filtered.length} shown on page ${page} · ${total} total records`}</p></div><Link href={`/admin/${section}/new`} className="inline-flex min-h-12 items-center gap-2 rounded bg-[#163e3a] px-5 font-semibold text-white hover:bg-[#235d56]"><Plus size={18}/> Add {config.singular.toLowerCase()}</Link></div>
  <div className="mt-8 flex flex-wrap gap-3 border-y border-[#d8d3c8] py-4"><label className="relative max-w-md flex-1"><span className="sr-only">Search {config.title.toLowerCase()}</span><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2"/><input value={q} onChange={e=>{setLoading(true);setError("");setPage(1);setQ(e.target.value)}} placeholder={`Search all ${config.title.toLowerCase()}`} className="min-h-11 w-full rounded border border-[#aaa99e] bg-white py-2 pl-10 pr-3" /></label>{["members","lexemes","articles","orthography"].includes(config.api)&&<label><span className="sr-only">Filter by status</span><select value={status} onChange={e=>{setLoading(true);setError("");setPage(1);setStatus(e.target.value)}} className="min-h-11 rounded border border-[#aaa99e] bg-white px-3"><option value="all">All states</option><option value="draft">Draft</option><option value="review">In review</option><option value="published">Published</option><option value="archived">Archived</option></select></label>}</div>
  {error && <p role="alert" className="mt-6 rounded border border-[#9a2e2e] p-4 text-[#9a2e2e]">{error}</p>}
  {!loading && !error && filtered.length===0 && <div className="py-16 text-center"><h2 className="font-serif text-2xl">{rows.length ? "No matching records" : `No ${config.title.toLowerCase()} yet`}</h2><p className="mt-3 text-[#4f625f]">{rows.length ? "Try another search or status." : `Add the first ${config.singular.toLowerCase()} when you have material ready.`}</p></div>}
  <div className="divide-y divide-[#d8d3c8]">{filtered.map(row=><Link key={String(row.id)} href={`/admin/${section}/${row.id}`} className="flex flex-wrap items-center justify-between gap-3 py-5 hover:bg-[#eae8de]"><div><strong className="text-lg">{String(row[config.label]??"Untitled")}</strong><p className="mt-1 text-sm text-[#4f625f]">{row.updated_at ? `Edited ${new Date(String(row.updated_at)).toLocaleDateString()}` : ""}</p></div><span className="rounded-full border border-[#c6cabe] px-3 py-1 text-xs font-semibold capitalize">{String(row.status??"Entry")}</span></Link>)}</div>{(page>1||hasMore)&&<nav aria-label="Record pages" className="mt-7 flex items-center gap-4 text-sm font-semibold"><button disabled={page===1} onClick={()=>{setLoading(true);setPage(page-1)}} className="min-h-10 rounded border border-[#163e3a] px-4 disabled:opacity-40">Previous</button><span>Page {page}</span><button disabled={!hasMore} onClick={()=>{setLoading(true);setPage(page+1)}} className="min-h-10 rounded border border-[#163e3a] px-4 disabled:opacity-40">Next</button></nav>}</>;
}
