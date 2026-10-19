import Link from "next/link";

export const metadata = { title: "Family space | Kutchi Roots" };

export default function FamilyInvitation() {
  return <main className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"><div className="max-w-3xl"><p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-[#9a533e]">Family space</p><h1 className="font-serif text-5xl leading-tight sm:text-6xl">Family histories deserve care.</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-[#4f625f]">The genealogy collection is private while records, permissions, and consent are established. Authorized administrators can explore and maintain the tree after signing in.</p><div className="mt-9 flex flex-wrap gap-4"><Link className="rounded bg-[#163e3a] px-6 py-3 font-semibold text-white" href="/family/tree">Open family tree</Link><Link className="rounded border border-[#163e3a] px-6 py-3 font-semibold" href="/login">Administrator sign in</Link></div></div><div aria-hidden="true" className="mt-20 grid grid-cols-3 gap-5 border-t border-[#d8d3c8] pt-8 opacity-60 sm:max-w-xl"><span className="h-24 rounded-t-full border border-[#a6b6ae]"/><span className="h-24 rounded-t-full border border-[#a6b6ae]"/><span className="h-24 rounded-t-full border border-[#a6b6ae]"/></div></main>;
}
