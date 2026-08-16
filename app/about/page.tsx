import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About MishBaby | Our Approach",
  description: "Learn how MishBaby approaches product discovery, recommendations, and affiliate transparency.",
};

const principles = [
  {
    number: "01",
    title: "Start with a real parent need",
    description: "We organize products and guidance around everyday questions, routines, and stages—not around a single store or promotion.",
  },
  {
    number: "02",
    title: "Explain the useful differences",
    description: "Recommendations should make important features and tradeoffs easier to understand, with clear language and enough context to choose confidently.",
  },
  {
    number: "03",
    title: "Keep products separate from stores",
    description: "A product can have offers from Amazon, AliExpress, or future merchants. The product recommendation should not belong to one retailer.",
  },
  {
    number: "04",
    title: "Be clear about what we know",
    description: "We will distinguish editorial research, product information, and hands-on experience rather than implying testing or expertise that did not happen.",
  },
];

export default function AboutPage() {
  return (
    <>
        <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-16 sm:px-8 md:py-24">
          <div className="absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-[#a8e8f5]/70 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 -z-10 size-72 rounded-full bg-[#d9f4ee]/75 blur-2xl" />
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.15fr_.85fr] md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">About MishBaby</p>
              <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">Helpful choices start with honest context.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#063f5b]/70">MishBaby is being built as a calmer place for parents to discover baby products, understand their options, and find the merchant offer that works for them.</p>
            </div>
            <div className="rounded-[2.5rem] bg-[#a8e8f5] p-5 shadow-[0_24px_55px_-38px_rgba(6,63,91,.45)]">
              <div className="grid aspect-square place-items-center rounded-[2rem] border border-white/65 bg-[#e8f8fc] p-8 text-center">
                <div>
                  <span className="mx-auto grid size-24 place-items-center rounded-full bg-[#009dcc] text-4xl text-white">♡</span>
                  <p className="mt-6 font-display text-3xl font-semibold leading-tight text-[#063f5b]">Simple now. Thoughtful as we grow.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-22">
          <div className="grid gap-10 md:grid-cols-[.8fr_1.2fr] md:gap-16">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Our purpose</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">Less noise between the question and a useful answer.</h2>
            </div>
            <div className="grid gap-5 text-base leading-8 text-[#063f5b]/70">
              <p>Shopping for a baby can turn one small need into dozens of tabs, conflicting opinions, and products that look almost identical. MishBaby’s role is to make that process easier to navigate.</p>
              <p>We want to bring product discovery, practical guides, and merchant options together in one friendly place. Parents should be able to understand why something may be useful before deciding where—or whether—to buy it.</p>
              <p>MishBaby does not sell products directly. When merchant links are introduced, purchases, delivery, returns, and customer service will remain with the selected retailer.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#f7fcfe] px-5 py-16 sm:px-8 md:py-22">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Our editorial approach</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">Four principles for useful recommendations.</h2>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {principles.map((principle) => (
                <article key={principle.number} className="rounded-[2rem] border border-[#063f5b]/8 bg-white p-7 shadow-[0_16px_36px_-28px_rgba(6,63,91,.4)] sm:p-8">
                  <span className="grid size-10 place-items-center rounded-full bg-[#e2f7fc] text-xs font-extrabold text-[#009dcc]">{principle.number}</span>
                  <h3 className="mt-6 text-xl font-extrabold tracking-[-0.03em] text-[#063f5b]">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#063f5b]/65">{principle.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-22">
          <div className="overflow-hidden rounded-[2rem] bg-[#063f5b] text-white md:grid md:grid-cols-[.8fr_1.2fr]">
            <div className="bg-[#009dcc] p-8 sm:p-10">
              <span className="grid size-14 place-items-center rounded-2xl bg-white/15 text-2xl" aria-hidden="true">↗</span>
              <p className="mt-8 text-sm font-extrabold uppercase tracking-[0.14em] text-white/75">Affiliate transparency</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em]">Trust matters more than a click.</h2>
            </div>
            <div className="grid content-center gap-5 p-8 text-sm leading-7 text-white/70 sm:p-10">
              <p>MishBaby may earn a commission when someone purchases through an eligible affiliate link. This should not increase the price paid by the shopper.</p>
              <p>Affiliate relationships will not change the basic product-and-offer structure: a product remains separate from the stores that sell it, and additional merchants can be shown when relevant.</p>
              <p>Prices, availability, shipping, and retailer policies can change. Final purchase details should always be confirmed on the merchant’s website.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 md:pb-22">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-[#063f5b]/8 bg-[#e8f8fc] px-7 py-10 sm:px-10 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">See MishBaby taking shape</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-[#063f5b]">Start with thoughtful product categories.</h2>
            </div>
            <Link href="/categories" className="shrink-0 rounded-full bg-[#009dcc] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0784b0]">Explore categories</Link>
          </div>
        </section>
    </>
  );
}
