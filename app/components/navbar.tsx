"use client";

import Link from "next/link";
import { useState } from "react";
import { Brand } from "./brand";

const links = ["Discover", "Guides", "About"];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-[#063f5b]/10 bg-[#fbfeff]/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <nav className="hidden items-center gap-8 text-sm font-bold text-[#063f5b]/75 md:flex" aria-label="Primary navigation">
          {links.map((link) => <Link key={link} href="#" className="transition-colors hover:text-[#009dcc]">{link}</Link>)}
        </nav>
        <Link href="#" className="hidden rounded-full bg-[#009dcc] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#0784b0] md:inline-flex">Explore picks</Link>
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="grid size-10 place-items-center rounded-full border border-[#063f5b]/15 text-[#063f5b] md:hidden" aria-expanded={isOpen} aria-controls="mobile-navigation">
          <span className="sr-only">Toggle menu</span>
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={isOpen ? "m6 6 12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} /></svg>
        </button>
      </div>
      {isOpen && <nav id="mobile-navigation" className="border-t border-[#063f5b]/10 px-5 py-4 md:hidden" aria-label="Mobile navigation"><div className="mx-auto flex max-w-6xl flex-col gap-1">{links.map((link) => <Link key={link} href="#" onClick={() => setIsOpen(false)} className="rounded-xl px-3 py-3 font-bold hover:bg-[#a8e8f5]/40">{link}</Link>)}<Link href="#" onClick={() => setIsOpen(false)} className="mt-2 rounded-full bg-[#009dcc] px-5 py-3 text-center text-sm font-extrabold text-white">Explore picks</Link></div></nav>}
    </header>
  );
}
