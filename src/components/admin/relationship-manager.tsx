"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DuplicateSuggestions, useDuplicateReview } from "./duplicate-review";
import type { DuplicateMatch } from "@/lib/duplicate-matching";
import { PersonPicker, type ConnectionPerson } from "./person-picker";

type Member=ConnectionPerson;
type Edge={id:string;person_a_id:string;person_b_id:string;kind:"parent"|"partner"|"sibling";parent_kind?:string;confidence:string;status:string;version:number};
async function loadAll<T>(resource:"members"|"relationships"):Promise<T[]>{
  const records:T[]=[];
  for(let page=1;;page++){
    const response=await fetch(`/api/admin/${resource}?limit=200&page=${page}`,{cache:"no-store"});
    const result=await response.json();
    if(!response.ok)throw Error(result.error||`Could not load ${resource}`);
    records.push(...(result.data||[]));
    if(!result.pagination?.hasMore)return records;
  }
}
export function RelationshipManager(){
  const [people,setPeople]=useState<Member[]>([]);const [edges,setEdges]=useState<Edge[]>([]);const [error,setError]=useState("");const [success,setSuccess]=useState("");const [busy,setBusy]=useState(false);
  const [loadingPeople,setLoadingPeople]=useState(true);const [peopleFailed,setPeopleFailed]=useState(false);
  const [publicEnabled,setPublicEnabled]=useState<boolean|undefined|null>(null);
  const [kind,setKind]=useState<"parent"|"partner"|"sibling">("parent");const [a,setA]=useState("");const [b,setB]=useState("");const [parentKind,setParentKind]=useState("unknown");const [confidence,setConfidence]=useState("uncertain");const [note,setNote]=useState("");const [status,setStatus]=useState("draft");
  const [formRevision,setFormRevision]=useState(0);
  const [createPerson,setCreatePerson]=useState(false);const [newSide,setNewSide]=useState<"a"|"b">("b");const [newName,setNewName]=useState("");const [newBio,setNewBio]=useState("");
  function useExistingPerson(match:DuplicateMatch){if(match.id===(newSide==="a"?b:a)){setError("A person cannot be connected to themself. Choose someone else.");return;}if(newSide==="a")setA(match.id);else setB(match.id);setCreatePerson(false);setError("");void load();}
  const duplicateReview=useDuplicateReview(useExistingPerson);
  async function load(reportError=true):Promise<boolean>{try{const [members,relationships]=await Promise.all([loadAll<Member>("members"),loadAll<Edge>("relationships")]);setPeople(members);setEdges(relationships);setPeopleFailed(false);return true}catch(e){setPeopleFailed(true);if(reportError)setError(e instanceof Error?e.message:"Could not load relationships");return false}finally{setLoadingPeople(false)}}
  // Initial data is fetched asynchronously before updating state.
  useEffect(()=>{void load()},[]);
  useEffect(()=>{const controller=new AbortController();fetch("/api/admin/tree/publication",{signal:controller.signal}).then(response=>response.ok?response.json():null).then(result=>setPublicEnabled(result?Boolean(result.data?.enabled):undefined)).catch(()=>{if(!controller.signal.aborted)setPublicEnabled(undefined)});return()=>controller.abort()},[]);
  const name=(id:string)=>people.find(p=>p.id===id)?.preferred_name||"Unknown person";
  const publicReady=(id:string)=>{const person=people.find(p=>p.id===id);return person?.status==="published"&&person.visibility==="public"&&person.living_status==="deceased"};
  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (
      (!(createPerson && newSide === "a") && !people.some(person => person.id === a)) ||
      (!(createPerson && newSide === "b") && !people.some(person => person.id === b)) ||
      (!createPerson && a === b)
    ) {
      setError("Choose a different existing person for each connection field.");
      return;
    }
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const relationship = {
        person_a_id: createPerson && newSide === "a" ? undefined : a,
        person_b_id: createPerson && newSide === "b" ? undefined : b,
        kind,
        parent_kind: kind === "parent" ? parentKind : null,
        confidence,
        note: note || null,
        status,
      };
      const res = await duplicateReview.submit(
        createPerson ? "/api/admin/relationships/with-member" : "/api/admin/relationships",
        createPerson ? {
          member: { preferred_name: newName.trim(), short_bio: newBio.trim() || null, status: "draft" },
          relationship,
          newMemberSide: newSide,
        } : relationship,
      );
      if (!res) return;
      const result = await res.json();
      if (!res.ok) throw Error(result.error || "Relationship could not be saved");

      // For a parent edge, the saved child is the natural starting point for the next generation.
      const savedChildId = kind === "parent"
        ? (createPerson && newSide === "b" ? result.data?.member?.id : b)
        : "";
      setA(savedChildId || "");
      setB("");
      setCreatePerson(false);
      setNewSide("b");
      setNewName("");
      setNewBio("");
      setParentKind("unknown");
      setConfidence("uncertain");
      setNote("");
      setStatus("draft");
      setFormRevision(revision => revision + 1);
      const savedMessage = kind === "parent" && savedChildId
        ? `${createPerson ? "Person and relationship saved. The new profile starts as a draft. " : "Relationship saved. "}The child is selected as the next parent; choose their child to continue the tree.`
        : createPerson
          ? "Person and relationship saved together. The new profile starts as a draft."
          : `Relationship saved as ${status}. It appears in the private tree.`;
      const refreshed = await load(false);
      setSuccess(refreshed ? savedMessage : "Relationship saved, but the people and connections list could not be refreshed. Retry loading people to continue.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Relationship could not be saved");
    } finally {
      setBusy(false);
    }
  }
  async function change(edge:Edge,nextStatus:string){setBusy(true);setError("");setSuccess("");try{const res=await fetch(`/api/admin/relationships/${edge.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({version:edge.version,status:nextStatus})});const j=await res.json();if(!res.ok)throw Error(j.error||"Could not update relationship");const refreshed=await load(false);setSuccess(refreshed?`Relationship ${nextStatus}.`:`Relationship ${nextStatus}, but the connections list could not be refreshed. Retry loading people to see the update.`)}catch(e){setError(e instanceof Error?e.message:"Could not update relationship")}finally{setBusy(false)}}
  return <><p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a533e]">Family archive</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Family relationships</h1><p className="mt-3 max-w-2xl text-[#4f625f]">Connect existing profiles. For parent relationships, the first person is the parent and the second is the child. Unknown and disputed connections can be recorded without pretending certainty.</p><p className="mt-3 max-w-2xl text-sm text-[#4f625f]">Saved connections appear in the private tree in every editorial state. To show one publicly, publish the connection and mark both people Published, Public, and Deceased, then enable the public tree in Settings.</p><div className="mt-4 flex gap-5 text-sm font-semibold"><Link href="/admin/family-members/new" className="underline">Add a new person</Link><Link href="/family/tree" className="underline">View the tree</Link></div>
  <p className="mt-4 text-sm font-semibold text-[#4f625f]">Public tree: {publicEnabled===null?"checking setting":publicEnabled===undefined?"setting unavailable":publicEnabled?"on":"off"}. <Link href="/admin/settings" className="underline underline-offset-4">Change setting</Link>.</p>
  {!createPerson&&a&&b&&status==="published"&&publicEnabled&&publicReady(a)&&publicReady(b)&&<p className="mt-3 rounded border border-[#8aa79d] bg-[#ecf5e9] p-3 text-sm">Saving this published connection will make it visible to visitors now.</p>}
  {!createPerson&&a&&b&&status==="published"&&(!publicReady(a)||!publicReady(b))&&<p className="mt-3 rounded border border-[#b7674e] bg-[#fff8ed] p-3 text-sm">This connection will stay private until both people are Published, Public, and Deceased.</p>}
  {createPerson&&status==="published"&&<p className="mt-3 rounded border border-[#b7674e] bg-[#fff8ed] p-3 text-sm">The new person starts as a private draft. Publish their profile and review public eligibility before this connection can appear publicly.</p>}
  {error&&<p role="alert" className="mt-6 rounded border border-[#9a2e2e] p-4 text-[#9a2e2e]">{error}</p>}{success&&<p role="status" className="mt-6 rounded border border-[#256b45] p-4 text-[#256b45]">{success}</p>}
  {peopleFailed&&<button type="button" disabled={loadingPeople||busy} onClick={()=>{setError("");setSuccess("");setLoadingPeople(true);void load()}} className="mt-3 min-h-11 font-semibold underline">{loadingPeople?"Loading people…":"Retry loading people"}</button>}
  <div className="mt-10 grid gap-10 xl:grid-cols-[420px_1fr]"><form key={formRevision} onSubmit={create} className="self-start border border-[#d8d3c8] bg-[#fffcf6] p-6"><h2 className="font-serif text-2xl">Add a connection</h2><div className="mt-6 grid gap-4"><label className="text-sm font-semibold">Relationship<select value={kind} onChange={e=>setKind(e.target.value as "parent"|"partner"|"sibling")} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3"><option value="parent">Parent → child</option><option value="partner">Partnership</option><option value="sibling">Siblings</option></select></label><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={createPerson} onChange={e=>setCreatePerson(e.target.checked)}/> Create a new profile for one person</label>{createPerson&&<><label className="text-sm font-semibold">New profile is<select value={newSide} onChange={e=>setNewSide(e.target.value as "a"|"b")} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3"><option value="a">{kind==="parent"?"Parent":kind==="sibling"?"First sibling":"First partner"}</option><option value="b">{kind==="parent"?"Child":kind==="sibling"?"Second sibling":"Second partner"}</option></select></label><label className="text-sm font-semibold">New person&apos;s preferred name<input required value={newName} onChange={e=>setNewName(e.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3"/></label><DuplicateSuggestions entity="people" value={newName} onUse={useExistingPerson}/><label className="text-sm font-semibold">Short biography<textarea value={newBio} onChange={e=>setNewBio(e.target.value)} rows={2} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3"/></label></>}{!(createPerson&&newSide==="a")&&<PersonPicker label={kind==="parent"?"Parent":kind==="sibling"?"First sibling":"First partner"} people={people} value={a} onChange={setA} excludeId={createPerson?undefined:b} loading={loadingPeople} failed={peopleFailed} disabled={busy}/>}{!(createPerson&&newSide==="b")&&<PersonPicker label={kind==="parent"?"Child":kind==="sibling"?"Second sibling":"Second partner"} people={people} value={b} onChange={setB} excludeId={createPerson?undefined:a} loading={loadingPeople} failed={peopleFailed} disabled={busy}/>}{kind==="parent"&&<label className="text-sm font-semibold">Parentage<select value={parentKind} onChange={e=>setParentKind(e.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3"><option value="unknown">Unknown</option><option value="biological">Biological</option><option value="adoptive">Adoptive</option></select></label>}<label className="text-sm font-semibold">Confidence<select value={confidence} onChange={e=>setConfidence(e.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3"><option value="uncertain">Uncertain</option><option value="confirmed">Confirmed</option><option value="disputed">Disputed</option></select></label><label className="text-sm font-semibold">Evidence or note<textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3"/></label><label className="text-sm font-semibold">Editorial state<select value={status} onChange={e=>setStatus(e.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3"><option value="draft">Draft</option><option value="review">In review</option><option value="published">Published (eligible for public tree)</option></select></label></div><div className="mt-5 border-l-2 border-[#b7674e] pl-4 text-sm"><strong>Preview:</strong> {createPerson&&newSide==="a"?newName||"New person":name(a)||"First person"} {kind==="parent"?"→":"↔"} {createPerson&&newSide==="b"?newName||"New person":name(b)||"Second person"}</div><button disabled={busy||people.length<(createPerson?1:2)} className="mt-6 min-h-12 w-full rounded bg-[#163e3a] px-5 font-semibold text-white disabled:opacity-50">{busy?"Saving…":createPerson?"Save person and relationship":"Save relationship"}</button><p className="mt-3 text-xs leading-5 text-[#4f625f]">The server checks self-links, duplicates, and ancestry cycles.</p></form>
  <section><h2 className="font-serif text-2xl">Recorded connections</h2>{edges.length===0?<p className="mt-5 border-t border-[#d8d3c8] py-6 text-[#4f625f]">No relationships recorded yet.</p>:<div className="mt-5 divide-y divide-[#d8d3c8] border-t border-[#d8d3c8]">{edges.map(edge=><div key={edge.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><p className="font-semibold">{name(edge.person_a_id)} <span className="text-[#9a533e]">{edge.kind==="parent"?"→":"↔"}</span> {name(edge.person_b_id)}</p><p className="mt-1 text-xs capitalize text-[#4f625f]">{edge.kind}{edge.parent_kind?` · ${edge.parent_kind}`:""} · {edge.confidence} · {edge.status}</p></div><div className="flex gap-3 text-xs font-semibold">{edge.status!=="published"&&<button onClick={()=>change(edge,"published")} className="underline">Publish</button>}{edge.status==="published"&&<button onClick={()=>change(edge,"draft")} className="underline">Unpublish</button>}{edge.status!=="archived"&&<button onClick={()=>change(edge,"archived")} className="text-[#9a2e2e] underline">Archive</button>}</div></div>)}</div>}</section></div>{duplicateReview.dialog}</>;
}
