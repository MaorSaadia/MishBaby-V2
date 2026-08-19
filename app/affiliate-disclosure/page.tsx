import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "Learn how MishBaby uses affiliate links and approaches merchant relationships with transparency.",
  alternates: {
    canonical: `${siteConfig.url}/affiliate-disclosure`,
  },
};

const disclosureSections = [
  {
    title: "How affiliate links work",
    body: "Some links on MishBaby are affiliate links. If you follow one of these links and complete a qualifying purchase or action, MishBaby may receive a commission from the merchant. MishBaby does not add a separate fee to your purchase.",
  },
  {
    title: "Our merchant relationships",
    body: "MishBaby currently uses affiliate links for merchants including Amazon and AliExpress, and may work with additional merchants or affiliate networks in the future. A product can have offers from more than one merchant, and the product itself remains separate from those offers.",
  },
  {
    title: "Editorial independence",
    body: "Affiliate relationships do not guarantee that a product will be included, featured, or recommended. MishBaby aims to organize products and guidance around usefulness and relevance for parents. We do not claim hands-on testing, professional expertise, or merchant endorsement unless that is stated clearly on the page.",
  },
  {
    title: "Purchases and merchant information",
    body: "MishBaby does not sell the listed products directly. Prices, availability, product details, shipping, returns, warranties, and customer service are controlled by the selected merchant and can change. Always confirm the final information on the merchant’s website before purchasing.",
  },
];

export default function AffiliateDisclosurePage() {
  return (
    <>
      <header className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-14 sm:px-8 md:py-22">
        <div className="absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-[#a8e8f5]/70 blur-3xl" />
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-bold text-[#063f5b]/55">
            <Link href="/" className="hover:text-[#009dcc]">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#063f5b]">Affiliate Disclosure</span>
          </nav>
          <p className="mt-10 text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Transparency first</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">Affiliate Disclosure</h1>
          <p className="mt-6 max-w-3xl text-xl leading-8 text-[#063f5b]/70">MishBaby helps parents discover products, compare merchant options, and read practical guides. Some merchant links may earn MishBaby a commission.</p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20">
        <section className="rounded-[2rem] border border-[#009dcc]/15 bg-[#e8f8fc] p-7 sm:p-9">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Amazon Associates disclosure</p>
          <p className="mt-4 font-display text-3xl font-semibold leading-tight text-[#063f5b]">As an Amazon Associate I earn from qualifying purchases.</p>
        </section>

        <div className="mt-12 grid gap-10">
          {disclosureSections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-[#063f5b]">{section.title}</h2>
              <p className="mt-4 text-base leading-8 text-[#063f5b]/70">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-14 rounded-[2rem] bg-[#063f5b] px-7 py-9 text-white sm:px-9">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a8e8f5]">Recognizing affiliate links</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">Look for the disclosure near merchant offers.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">Product pages identify merchant links near the offer comparison. These links open the merchant’s website, where the merchant’s current terms and policies apply.</p>
        </section>
      </div>
    </>
  );
}
