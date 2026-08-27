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
      <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-10 sm:px-8 sm:py-14 md:py-20">
        <div className="absolute -right-16 -top-16 -z-10 size-80 rounded-full bg-[#a8e8f5]/65 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc] sm:text-sm">Amazon Finds</p>
          <h1 className="mt-3 max-w-3xl break-words font-display text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#063f5b] sm:text-6xl sm:leading-[1.05]">Search more baby products on Amazon.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#063f5b]/70 sm:mt-5 sm:text-lg sm:leading-8">Explore Amazon’s Baby catalog without mixing these live results into MishBaby’s carefully curated product collection.</p>
        </div>
      </section>
      <section className="bg-[#f7fcfe] px-4 py-10 sm:px-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-6xl"><AmazonSearch /></div>
      </section>
    </>
  );
}
