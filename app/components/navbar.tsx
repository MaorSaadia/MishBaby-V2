"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Brand } from "./brand";
import { NavbarSearch } from "./navbar-search";
import type { ProductSearchItem } from "@/lib/products";
import { AccountMenu } from "./auth/account-menu";
import { ThemeToggle } from "./theme-toggle";

const linksBeforeFinds = [
  { label: "Products", href: "/products" },
  { label: "Discover", href: "/categories" },
];

const findsLinks = [
  { label: "Amazon Finds", href: "/amazon-finds", description: "Search Amazon's Baby catalog" },
  { label: "AliExpress Finds", href: "/aliexpress-finds", description: "Search AliExpress baby products" },
];

const linksAfterFinds = [
  { label: "Guides", href: "/guides" },
  { label: "About", href: "/about" },
];

const mobileLinks = [...linksBeforeFinds, ...findsLinks, ...linksAfterFinds];

export function Navbar({ products }: { products: ProductSearchItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [findsOpen, setFindsOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const findsButtonRef = useRef<HTMLButtonElement>(null);
  const findsMenuRef = useRef<HTMLDivElement>(null);

  function focusFirstFindsLink() {
    window.requestAnimationFrame(() => findsMenuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus());
  }

  useEffect(() => {
    function closeFindsOnOutsideClick(event: PointerEvent) {
      if (findsMenuRef.current?.contains(event.target as Node)) return;
      setFindsOpen(false);
    }

    document.addEventListener("pointerdown", closeFindsOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeFindsOnOutsideClick);
  }, []);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleEscape(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape") return;
    if (searchOpen) {
      setSearchOpen(false);
      searchButtonRef.current?.focus();
    } else if (findsOpen) {
      setFindsOpen(false);
      findsButtonRef.current?.focus();
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
      if (!current) {
        setSearchOpen(false);
        setFindsOpen(false);
      }
      return !current;
    });
  }

  function handleFindsButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setFindsOpen(true);
    focusFirstFindsLink();
  }

  function handleFindsBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFindsOpen(false);
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
          {linksBeforeFinds.map((link) => {
            const active = isActive(link.href);

            return <Link key={link.label} href={link.href} aria-current={active ? "page" : undefined} className={`rounded-md transition-colors hover:text-[#009dcc] ${active ? "text-[#009dcc]" : ""}`}>{link.label}</Link>;
          })}
          <div ref={findsMenuRef} className="relative" onBlur={handleFindsBlur}>
            <button
              ref={findsButtonRef}
              type="button"
              onClick={() => setFindsOpen((current) => !current)}
              onKeyDown={handleFindsButtonKeyDown}
              aria-haspopup="true"
              aria-expanded={findsOpen}
              aria-controls="finds-navigation"
              className={`flex items-center gap-1.5 rounded-md transition-colors hover:text-[#009dcc] ${pathname.startsWith("/amazon-finds") || pathname.startsWith("/aliexpress-finds") ? "text-[#009dcc]" : ""}`}
            >
              Finds
              <svg viewBox="0 0 20 20" aria-hidden="true" className={`size-4 transition-transform ${findsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="m6 8 4 4 4-4" />
              </svg>
            </button>
            {findsOpen && (
              <div id="finds-navigation" className="absolute left-1/2 top-[calc(100%+1rem)] w-64 -translate-x-1/2 rounded-2xl border border-[#063f5b]/10 bg-white p-2 shadow-[0_22px_55px_-28px_rgba(6,63,91,.55)]">
                {findsLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setFindsOpen(false)}
                      className={`block rounded-xl px-3 py-3 transition-colors hover:bg-[#e8f8fc] ${active ? "bg-[#e2f7fc]" : ""}`}
                    >
                      <span className="block font-extrabold text-[#063f5b]">{link.label}</span>
                      <span className="mt-0.5 block text-xs font-normal leading-5 text-[#063f5b]/60">{link.description}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          {linksAfterFinds.map((link) => {
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
            {mobileLinks.map((link) => {
              const active = isActive(link.href);
              return <Link key={link.label} href={link.href} aria-current={active ? "page" : undefined} onClick={() => setIsOpen(false)} className={`rounded-xl px-3 py-3 font-bold hover:bg-[#a8e8f5]/40 ${active ? "bg-[#e2f7fc] text-[#007fa5]" : ""}`}>{link.label}</Link>;
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
