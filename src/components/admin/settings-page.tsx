"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicFamilySettings } from "./public-family-settings";

type Profile = { id: string; email: string; display_name: string; is_founder: boolean; must_change_password: boolean };
const field = "mt-2 min-h-12 w-full rounded border border-[#aaa99e] bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-[#163e3a]";
const button = "mt-4 min-h-12 w-full rounded bg-[#163e3a] px-5 font-semibold text-white disabled:opacity-50 sm:w-auto";

export function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState("");
  const [feedback, setFeedback] = useState<Record<string, { error: boolean; text: string }>>({});
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/profile", { signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not load your account.");
      return result.data as Profile;
    }).then(data => { setProfile(data); setName(data.display_name || ""); setEmail(data.email || ""); })
      .catch(error => { if (error.name !== "AbortError") setLoadError(error.message); });
    return () => controller.abort();
  }, []);
  async function save(kind: string, changes: Record<string, string>) {
    setBusy(kind); setFeedback(previous => ({ ...previous, [kind]: { error: false, text: "" } }));
    try {
      const response = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not save changes.");
      if (result.data) setProfile(result.data);
      if (kind === "password") { setCurrentPassword(""); setPassword(""); setConfirm(""); }
      setFeedback(previous => ({ ...previous, [kind]: { error: false, text: kind === "email" ? (result.data?.email_confirmation_pending ? "Check your new email for a confirmation link. Your current address remains active until confirmed." : "Email updated.") : kind === "name" ? "Display name updated." : "Password updated." } }));
    } catch (error) { setFeedback(previous => ({ ...previous, [kind]: { error: true, text: error instanceof Error ? error.message : "Could not save changes." } })); }
    finally { setBusy(""); }
  }
  function status(kind: string) { const item = feedback[kind]; return item?.text ? <p role={item.error ? "alert" : "status"} className={`mt-3 text-sm ${item.error ? "text-[#9a2e2e]" : "text-[#256b45]"}`}>{item.text}</p> : null; }
  return <>
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a533e]">Archive controls</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Settings</h1>
    <section className="mt-8 max-w-3xl"><h2 className="font-serif text-3xl">Your account</h2><p className="mt-2 text-sm leading-6 text-[#4f625f]">Manage the name, email, and password you use to sign in.</p>
      {loadError && <p role="alert" className="mt-5 text-[#9a2e2e]">{loadError}</p>}{!profile && !loadError && <p role="status" className="mt-5">Loading your account…</p>}
      {profile && <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <form onSubmit={event => { event.preventDefault(); save("name", { display_name: name.trim() }); }} className="rounded border border-[#d8d3c8] bg-[#fffcf6] p-5 sm:p-6"><h3 className="font-serif text-2xl">Display name</h3><label htmlFor="profile-name" className="mt-5 block text-sm font-semibold">Your name</label><input id="profile-name" autoComplete="name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} className={field}/>{status("name")}<button disabled={Boolean(busy) || name.trim() === profile.display_name} className={button}>{busy === "name" ? "Saving…" : "Save name"}</button></form>
        <form onSubmit={event => { event.preventDefault(); save("email", { email: email.trim() }); }} className="rounded border border-[#d8d3c8] bg-[#fffcf6] p-5 sm:p-6"><h3 className="font-serif text-2xl">Sign-in email</h3><label htmlFor="profile-email" className="mt-5 block text-sm font-semibold">Email address</label><input id="profile-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className={field}/><p className="mt-2 text-xs leading-5 text-[#4f625f]">A confirmation link may be sent to your new address.</p>{status("email")}<button disabled={Boolean(busy) || email.trim().toLowerCase() === profile.email.toLowerCase()} className={button}>{busy === "email" ? "Saving…" : "Change email"}</button></form>
        <form onSubmit={event => { event.preventDefault(); if (password !== confirm) { setFeedback(previous => ({ ...previous, password: { error: true, text: "New passwords do not match." } })); return; } save("password", { current_password: currentPassword, password }); }} className="rounded border border-[#d8d3c8] bg-[#fffcf6] p-5 lg:col-span-2 sm:p-6"><h3 className="font-serif text-2xl">Password</h3><p className="mt-2 text-sm text-[#4f625f]">Use a unique password of at least 12 characters.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label htmlFor="current-password" className="block text-sm font-semibold">Current password</label><input id="current-password" type={show ? "text" : "password"} autoComplete="current-password" required value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className={field}/></div><div><label htmlFor="new-password" className="block text-sm font-semibold">New password</label><input id="new-password" type={show ? "text" : "password"} autoComplete="new-password" required minLength={12} value={password} onChange={event => setPassword(event.target.value)} className={field}/></div><div><label htmlFor="confirm-password" className="block text-sm font-semibold">Confirm new password</label><input id="confirm-password" type={show ? "text" : "password"} autoComplete="new-password" required minLength={12} value={confirm} onChange={event => setConfirm(event.target.value)} className={field}/></div></div><label className="mt-3 flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={show} onChange={event => setShow(event.target.checked)} className="h-4 w-4"/> Show passwords</label>{status("password")}<button disabled={Boolean(busy)} className={button}>{busy === "password" ? "Updating…" : "Update password"}</button></form>
      </div>}
    </section>
    <div className="mt-10 grid gap-6 lg:grid-cols-2"><section className="border border-[#d8d3c8] bg-[#fffcf6] p-6"><h2 className="font-serif text-2xl">Editorial reference</h2><p className="mt-3 leading-7 text-[#4f625f]">Manage the current writing guide, topic categories, and source citations.</p><div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">{[{href:"/admin/orthography",text:"Orthography"},{href:"/admin/categories",text:"Categories"},{href:"/admin/sources",text:"Sources"}].map(item=><Link key={item.href} href={item.href} className="border-b border-current pb-1">{item.text}</Link>)}</div></section><PublicFamilySettings/><section className="border border-[#d8d3c8] bg-[#fffcf6] p-6"><h2 className="font-serif text-2xl">Data exports</h2><p className="mt-3 text-sm leading-6 text-[#4f625f]">Download structured JSON with stable IDs and provenance. Media files require a separate object backup.</p><div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold"><Link href="/api/admin/export/family" className="border-b border-current pb-1">Export genealogy</Link><Link href="/api/admin/export/dictionary" className="border-b border-current pb-1">Export dictionary</Link></div></section></div>
  </>;
}
