"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Brand } from "./brand";
import { NavbarSearch } from "./navbar-search";
import type { ProductSearchItem } from "@/lib/products";
import { AccountMenu } from "./auth/account-menu";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { label: "Products", href: "/products" },
  { label: "Discover", href: "/categories" },
  { label: "Amazon Finds", href: "/amazon-finds" },
  { label: "Guides", href: "/guides" },
  { label: "About", href: "/about" },
];

export function Navbar({ products }: { products: ProductSearchItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleEscape(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape") return;
    if (searchOpen) {
      setSearchOpen(false);
      searchButtonRef.current?.focus();
    } else if (isOpen) {
      setIsOpen(false);
      menuButtonRef.current?.focus();
    }
  }

  function toggleSearch() {
    setSearchOpen((current) => {
      if (!current) setIsOpen(false);
      return !current;
    });
  }

  function toggleMenu() {
    setIsOpen((current) => {
      if (!current) setSearchOpen(false);
      return !current;
    });
  }

  return (
    <header className="relative z-40 border-b border-[#063f5b]/10 bg-[#fbfeff]/95 backdrop-blur" onKeyDown={handleEscape}>
      <div className="mx-auto flex min-h-18 max-w-6xl flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:px-8 lg:flex-nowrap lg:gap-x-5 lg:py-0">
        <Brand />
        <div id="navbar-search-panel" className={`${searchOpen ? "block" : "hidden"} order-3 w-full basis-full lg:order-none lg:block lg:basis-auto lg:max-w-md lg:flex-1`}>
          <NavbarSearch
            products={products}
            focusRequested={searchOpen}
            onNavigate={() => setSearchOpen(false)}
            onOpenRequest={() => { setSearchOpen(true); setIsOpen(false); }}
            onRequestClose={() => setSearchOpen(false)}
          />
        </div>
        <nav className="ml-auto hidden shrink-0 items-center gap-6 text-sm font-bold text-[#063f5b]/75 lg:flex" aria-label="Primary navigation">
          {links.map((link) => {
            const active = isActive(link.href);

            return <Link key={link.label} href={link.href} aria-current={active ? "page" : undefined} className={`rounded-md transition-colors hover:text-[#009dcc] ${active ? "text-[#009dcc]" : ""}`}>{link.label}</Link>;
          })}
        </nav>
        <div className="hidden lg:block"><ThemeToggle /></div>
        <div className="hidden lg:block"><AccountMenu /></div>
        <div className="ml-auto flex items-center gap-1.5 lg:hidden">
          <button ref={searchButtonRef} type="button" onClick={toggleSearch} className="grid size-9 shrink-0 place-items-center rounded-full border border-[#063f5b]/15 bg-white text-[#063f5b] transition-colors hover:border-[#009dcc]/40 hover:text-[#009dcc] sm:size-10" aria-expanded={searchOpen} aria-controls="navbar-search-panel">
            <span className="sr-only">{searchOpen ? "Close" : "Open"} product search</span>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {searchOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>}
            </svg>
          </button>
          <ThemeToggle compact />
          <AccountMenu compact onOpen={() => { setSearchOpen(false); setIsOpen(false); }} />
          <button ref={menuButtonRef} type="button" onClick={toggleMenu} className="grid size-9 shrink-0 place-items-center rounded-full border border-[#063f5b]/15 bg-white text-[#063f5b] transition-colors hover:border-[#009dcc]/40 hover:text-[#009dcc] sm:size-10" aria-expanded={isOpen} aria-controls="mobile-navigation">
            <span className="sr-only">{isOpen ? "Close" : "Open"} navigation menu</span>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d={isOpen ? "m6 6 12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} /></svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <nav id="mobile-navigation" className="border-t border-[#063f5b]/10 px-5 py-4 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {links.map((link) => {
              const active = isActive(link.href);
              return <Link key={link.label} href={link.href} aria-current={active ? "page" : undefined} onClick={() => setIsOpen(false)} className={`rounded-xl px-3 py-3 font-bold hover:bg-[#a8e8f5]/40 ${active ? "bg-[#e2f7fc] text-[#007fa5]" : ""}`}>{link.label}</Link>;
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
