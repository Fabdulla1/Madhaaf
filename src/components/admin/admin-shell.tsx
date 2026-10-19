"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X, ExternalLink } from "lucide-react";
import { navigation } from "@/lib/admin-config";

export function AdminShell({children, email}:{children:React.ReactNode;email:string}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open,setOpen] = useState(false);
  const [busy,setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", {method:"POST"});
    router.replace("/login"); router.refresh();
  }
  return <div className="min-h-screen bg-[#f7f3ea] text-[#163e3a] lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
    <aside className={`${open ? "block" : "hidden"} fixed inset-0 z-40 overflow-y-auto border-r border-[#d8d3c8] bg-[#163e3a] p-6 text-[#f7f3ea] lg:sticky lg:top-0 lg:block lg:h-screen`}>
      <div className="flex items-start justify-between"><Link href="/admin" onClick={()=>setOpen(false)} className="font-serif text-2xl leading-tight">Kutchi Roots <span className="mt-1 block font-sans text-[10px] uppercase tracking-[.24em] opacity-70">Editorial archive</span></Link><button className="lg:hidden" aria-label="Close navigation" onClick={()=>setOpen(false)}><X/></button></div>
      <nav aria-label="Administrator" className="mt-12 space-y-1">{navigation.map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} aria-current={pathname===item.href || (item.href!=="/admin" && pathname.startsWith(item.href+"/")) ? "page" : undefined} className={`block rounded px-3 py-3 text-sm transition-colors hover:bg-white/10 ${pathname===item.href || (item.href!=="/admin" && pathname.startsWith(item.href+"/")) ? "bg-white/15 font-semibold" : "text-[#d8e2da]"}`}>{item.label}</Link>)}</nav>
      <div className="mt-10 border-t border-white/20 pt-5 text-sm"><p className="truncate text-[#d8e2da]" title={email}>{email}</p><Link href="/" className="mt-4 flex items-center gap-2 py-2">Public website <ExternalLink size={15}/></Link><button disabled={busy} onClick={logout} className="mt-2 flex w-full items-center gap-2 py-2 text-left disabled:opacity-50"><LogOut size={16}/> Sign out</button></div>
    </aside>
    <div className="min-w-0"><header className="flex items-center justify-between border-b border-[#d8d3c8] px-5 py-4 lg:hidden"><button className="flex items-center gap-2 font-semibold" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu size={20}/> Menu</button><span className="font-serif text-xl">Kutchi Roots</span></header><main id="main-content" className="mx-auto w-full max-w-[1300px] px-5 py-8 sm:px-8 lg:px-10 lg:py-11">{children}</main></div>
  </div>;
}
