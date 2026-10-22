"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccountSetupForm() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) { setError("New passwords do not match."); return; }
    if (password === current) { setError("Choose a password different from the temporary one."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current_password: current, password }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not change your password.");
      router.replace("/admin"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not change your password."); }
    finally { setBusy(false); }
  }
  const field = "mt-2 min-h-12 w-full rounded border border-[#aaa99e] bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-[#163e3a]";
  return <section aria-labelledby="setup-title" className="mx-auto mt-12 max-w-lg rounded border border-[#d8d3c8] bg-[#fffcf6] p-6 shadow-sm sm:mt-20 sm:p-9">
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a533e]">Account setup</p>
    <h1 id="setup-title" className="mt-3 font-serif text-4xl">Create your own password</h1>
    <p className="mt-4 text-sm leading-6 text-[#4f625f]">Your temporary password lets you sign in once. Choose a unique password of at least 12 characters to open the dashboard.</p>
    <form onSubmit={submit} className="mt-7 space-y-5">
      <div><label htmlFor="setup-current" className="block text-sm font-semibold">Temporary password</label><input id="setup-current" type={show ? "text" : "password"} autoComplete="current-password" required value={current} onChange={event => setCurrent(event.target.value)} className={field}/></div>
      <div><label htmlFor="setup-new" className="block text-sm font-semibold">New password</label><input id="setup-new" type={show ? "text" : "password"} autoComplete="new-password" required minLength={12} value={password} onChange={event => setPassword(event.target.value)} className={field}/></div>
      <div><label htmlFor="setup-confirm" className="block text-sm font-semibold">Confirm new password</label><input id="setup-confirm" type={show ? "text" : "password"} autoComplete="new-password" required minLength={12} value={confirm} onChange={event => setConfirm(event.target.value)} className={field}/></div>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={show} onChange={event => setShow(event.target.checked)} className="h-4 w-4"/> Show passwords</label>
      {error && <p role="alert" className="rounded border border-[#9a2e2e] p-3 text-sm text-[#9a2e2e]">{error}</p>}
      <button disabled={busy} className="min-h-12 w-full rounded bg-[#163e3a] px-5 font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save password and continue"}</button>
    </form>
  </section>;
}
