"use client";

import Link from "next/link";
import { useCallback,useEffect,useState } from "react";

type Kind="article_categories"|"article_sources"|"lexeme_sources"|"member_sources"|"article_lexemes";
type Item={id:string;title?:string;headword?:string;slug?:string};
type LinkRow=Record<string,unknown>;
const ownerOf:Record<Kind,string>={article_categories:"article_id",article_sources:"article_id",lexeme_sources:"lexeme_id",member_sources:"member_id",article_lexemes:"article_id"};
const targetOf:Record<Kind,string>={article_categories:"category_id",article_sources:"source_id",lexeme_sources:"source_id",member_sources:"source_id",article_lexemes:"lexeme_id"};
const resourceOf:Record<Kind,string>={article_categories:"categories",article_sources:"sources",lexeme_sources:"sources",member_sources:"sources",article_lexemes:"lexemes"};
const labels:Record<Kind,string>={article_categories:"Categories",article_sources:"Cited sources",lexeme_sources:"Word sources",member_sources:"Family evidence",article_lexemes:"Linked words"};

export function ReferencesEditor({kind,ownerId,disabled=false}:{kind:Kind;ownerId:string;disabled?:boolean}){
  const [available,setAvailable]=useState<Item[]>([]);const [linked,setLinked]=useState<LinkRow[]>([]);const [selected,setSelected]=useState("");const [error,setError]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
  const ownerKey=ownerOf[kind],targetKey=targetOf[kind],resource=resourceOf[kind];
  const load=useCallback(async()=>{try{
    const choices=async()=>{
      const rows:Item[]=[];
      for(let page=1;;page++){
        const response=await fetch(`/api/admin/${resource}?limit=200&page=${page}`,{cache:"no-store"});
        const result=await response.json();
        if(!response.ok)throw Error(result.error||"Could not load reference choices");
        rows.push(...(result.data||[]));
        if(!result.pagination?.hasMore)break;
      }
      return rows;
    };
    const [items,response]=await Promise.all([choices(),fetch(`/api/admin/references?kind=${kind}&owner_id=${ownerId}`,{cache:"no-store"})]);
    const result=await response.json();
    if(!response.ok)throw Error(result.error||"Could not load references");
    setAvailable(items);setLinked(result.data||[]);return true;
  }catch(e){setError(e instanceof Error?e.message:"Could not load references");return false}},[kind,ownerId,resource]);
  // The request completes before updating the reference lists.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{void load()},[load]);
  async function act(method:"POST"|"DELETE",targetId:string){if(disabled||busy)return;setBusy(true);setError("");setMessage("");try{const r=await fetch("/api/admin/references",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,[ownerKey]:ownerId,[targetKey]:targetId})});const j=await r.json();if(!r.ok)throw Error(j.error||"Could not update reference");setSelected("");const refreshed=await load();if(refreshed)setMessage(method==="POST"?"Reference attached.":"Reference removed.")}catch(e){setError(e instanceof Error?e.message:"Could not update reference")}finally{setBusy(false)}}
  const display=(item:Item)=>item.title||item.headword||item.id;
  const linkedIds=new Set(linked.map(row=>String(row[targetKey])));
  return <section className="mt-9 border-t border-[#d8d3c8] pt-7"><h2 className="font-serif text-2xl">{labels[kind]}</h2>{error&&<p role="alert" className="mt-3 text-sm text-[#9a2e2e]">{error}</p>}{message&&<p role="status" className="mt-3 text-sm text-[#256b45]">{message}</p>}{disabled&&<p className="mt-2 text-sm text-[#4f625f]">Unpublish this entry before changing its references.</p>}
  {!disabled&&<div className="mt-4 flex flex-wrap gap-2"><select value={selected} onChange={e=>setSelected(e.target.value)} aria-label={`Choose ${labels[kind].toLowerCase()}`} className="min-h-11 min-w-0 flex-1 rounded border border-[#aaa99e] bg-white p-2"><option value="">Choose existing {labels[kind].toLowerCase()}</option>{available.filter(item=>!linkedIds.has(item.id)).map(item=><option key={item.id} value={item.id}>{display(item)}</option>)}</select><button disabled={!selected||busy} onClick={()=>act("POST",selected)} className="min-h-11 rounded bg-[#163e3a] px-4 font-semibold text-white disabled:opacity-50">Attach</button></div>}
  {!available.length&&<p className="mt-2 text-sm text-[#4f625f]">Create a record first in <Link href={`/admin/${resource==="lexemes"?"dictionary":resource}`} className="font-semibold underline">{resource}</Link>.</p>}
  <ul className="mt-4 divide-y divide-[#d8d3c8]">{linked.map(row=>{const item=(row[resource] as Item|undefined)||available.find(x=>x.id===row[targetKey]);const target=String(row[targetKey]);return <li key={target} className="flex items-center justify-between gap-3 py-2 text-sm"><span>{item?display(item):target}</span>{!disabled&&<button disabled={busy} onClick={()=>act("DELETE",target)} className="font-semibold text-[#9a2e2e] underline">Remove</button>}</li>})}</ul>
  </section>;
}
