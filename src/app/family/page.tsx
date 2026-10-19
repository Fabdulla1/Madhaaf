import { PublicFamilyEntry } from "@/components/family/public-family-entry";

export const metadata = { title: "Family space | Kutchi Roots" };

export default function FamilyInvitation() {
  return <main className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"><div className="max-w-3xl"><p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-[#9a533e]">Family space</p><h1 className="font-serif text-5xl leading-tight sm:text-6xl">Family histories deserve care.</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-[#4f625f]">Explore the part of the family tree that has been reviewed for public sharing. Private family records remain available only to authorized administrators.</p><PublicFamilyEntry/></div><div aria-hidden="true" className="mt-20 grid grid-cols-3 gap-5 border-t border-[#d8d3c8] pt-8 opacity-60 sm:max-w-xl"><span className="h-24 rounded-t-full border border-[#a6b6ae]"/><span className="h-24 rounded-t-full border border-[#a6b6ae]"/><span className="h-24 rounded-t-full border border-[#a6b6ae]"/></div></main>;
}
