"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [resetMode, setResetMode] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(resetMode ? "/api/auth/reset" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetMode ? { email } : { email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not complete your request.");
      if (resetMode) setMessage("If this account can receive reset email, instructions are on their way.");
      else { router.push(result.data?.must_change_password ? "/admin/account/setup" : "/admin"); router.refresh(); }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f7f3ea] px-5 py-8 text-[#163e3a] sm:px-8">
    <div className="mx-auto max-w-6xl"><Link href="/" className="font-serif text-2xl font-semibold">Madhaaf</Link></div>
    <div className="mx-auto mt-16 grid max-w-6xl gap-12 border-t border-[#cfc9bb] pt-12 lg:grid-cols-[1fr_420px] lg:gap-24">
      <section className="max-w-xl"><p className="mb-5 text-xs font-semibold uppercase tracking-[.22em] text-[#9a533e]">Private archive</p><h1 className="font-serif text-5xl leading-[1.08] sm:text-6xl">A place to care for what we know.</h1><p className="mt-7 max-w-md text-lg leading-8 text-[#4f625f]">The family collection and editorial workspace are available to authorized administrators. Published words and stories remain open to everyone.</p><Link href="/" className="mt-9 inline-flex items-center gap-2 border-b border-current pb-1 font-semibold">Return to the public site <ArrowRight size={17}/></Link></section>
      <section className="self-start rounded-md border border-[#d8d3c8] bg-[#fffcf6] p-6 sm:p-9" aria-labelledby="login-title"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#9a533e]">Administrator access</p><h2 id="login-title" className="mt-3 font-serif text-3xl">{resetMode ? "Reset your password" : "Sign in"}</h2><p className="mt-3 text-sm leading-6 text-[#4f625f]">{resetMode ? "Enter your administrator email to request reset instructions." : "Use the account provisioned for this archive. Public registration is unavailable."}</p>
      <form onSubmit={submit} className="mt-7 space-y-5">
        <div><label htmlFor="email" className="mb-2 block text-sm font-semibold">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded border border-[#aaa99e] bg-white px-4 py-3 outline-none focus:border-[#163e3a]" /></div>
        {!resetMode && <div><label htmlFor="password" className="mb-2 block text-sm font-semibold">Password</label><div className="relative"><input id="password" type={visible ? "text" : "password"} autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded border border-[#aaa99e] bg-white px-4 py-3 pr-14 outline-none focus:border-[#163e3a]"/><button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={()=>setVisible(!visible)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center">{visible ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div></div>}
        {message && <p role="status" className="rounded border border-[#d8d3c8] bg-[#f7f3ea] p-3 text-sm">{message}</p>}
        <button disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded bg-[#163e3a] px-5 font-semibold text-white hover:bg-[#235d56] disabled:opacity-60">{busy ? "Please wait…" : resetMode ? "Send reset instructions" : "Sign in"}<ArrowRight size={17}/></button>
      </form><button type="button" onClick={()=>{setResetMode(!resetMode);setMessage("")}} className="mt-5 text-sm font-semibold underline underline-offset-4">{resetMode ? "Return to sign in" : "Forgot your password?"}</button></section>
    </div>
  </main>;
}
