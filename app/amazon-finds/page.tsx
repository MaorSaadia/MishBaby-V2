import type { Metadata } from "next";
import { AmazonSearch } from "./amazon-search";

export const metadata: Metadata = {
  title: "Amazon Baby Product Search",
  description: "Search Amazon’s Baby catalog through MishBaby and open attributed Amazon product links.",
  alternates: { canonical: "/amazon-finds" },
  robots: { index: false, follow: false, noarchive: true },
};

export default function AmazonFindsPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-14 sm:px-8 md:py-20">
        <div className="absolute -right-16 -top-16 -z-10 size-80 rounded-full bg-[#a8e8f5]/65 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Amazon Finds</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">Search more baby products on Amazon.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#063f5b]/70">Explore Amazon’s Baby catalog without mixing these live results into MishBaby’s carefully curated product collection.</p>
        </div>
      </section>
      <section className="bg-[#f7fcfe] px-5 py-12 sm:px-8 md:py-16">
        <div className="mx-auto max-w-6xl"><AmazonSearch /></div>
      </section>
    </>
  );
}
