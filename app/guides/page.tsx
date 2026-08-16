import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navbar";
import { guides } from "./guide-data";

export const metadata: Metadata = {
  title: "Parenting & Buying Guides | MishBaby",
  description: "Practical parenting guidance and thoughtful baby-product buying guides from MishBaby.",
};

export default function GuidesPage() {
  const [featuredGuide, ...moreGuides] = guides;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-16 sm:px-8 md:py-22">
          <div className="absolute -right-20 -top-20 -z-10 size-96 rounded-full bg-[#a8e8f5]/70 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 -z-10 size-72 rounded-full bg-[#d9f4ee]/70 blur-2xl" />
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">MishBaby guides</p>
            <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">Practical guidance, minus the noise.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#063f5b]/70">Clear buying guides, useful checklists, and friendly ideas to help you make confident choices for your family.</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <div className="grid overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-white shadow-[0_20px_48px_-34px_rgba(6,63,91,.4)] md:grid-cols-[.85fr_1.15fr]">
            <div className={`grid min-h-72 place-items-center ${featuredGuide.color} text-7xl text-[#009dcc]`} aria-hidden="true">{featuredGuide.symbol}</div>
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#e8f8fc] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[#009dcc]">Featured guide</span>
                <span className="text-xs font-bold text-[#063f5b]/45">{featuredGuide.category}</span>
              </div>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-[-0.045em] text-[#063f5b]">{featuredGuide.title}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#063f5b]/65">{featuredGuide.description}</p>
              {featuredGuide.status === "published" && <Link href={`/guides/${featuredGuide.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">Read the guide <span aria-hidden="true">→</span></Link>}
            </div>
          </div>
        </section>

        <section className="bg-[#f7fcfe] px-5 py-14 sm:px-8 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">More helpful reads</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">Guidance for everyday decisions.</h2>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {moreGuides.map((guide) => (
                <article key={guide.title} className="overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-white shadow-[0_16px_36px_-28px_rgba(6,63,91,.4)]">
                  <div className={`grid h-36 place-items-center ${guide.color} text-4xl text-[#009dcc]`} aria-hidden="true">{guide.symbol}</div>
                  <div className="p-6">
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#009dcc]">{guide.category}</p>
                    <h3 className="mt-3 text-xl font-extrabold leading-snug tracking-[-0.03em] text-[#063f5b]">{guide.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#063f5b]/65">{guide.description}</p>
                    <p className="mt-5 text-xs font-extrabold text-[#063f5b]/45">In preparation</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-22">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-[#063f5b] px-7 py-10 text-white sm:px-10 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a8e8f5]">Prefer to browse products?</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">Discover thoughtful finds by category.</h2>
            </div>
            <Link href="/categories" className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#063f5b] transition hover:bg-[#e8f8fc]">Explore categories</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
