import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const title = "Affiliate partnerships";
const description =
  "Partner with MishBaby to feature your baby products through affiliate links. We promote your products and earn a commission on qualifying sales.";
const email = "mishbabyshop@gmail.com";
const emailHref = `mailto:${email}?subject=${encodeURIComponent("Affiliate partnership inquiry for MishBaby")}`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/advertise" },
  openGraph: {
    type: "website",
    title: `${title} | ${siteConfig.name}`,
    description,
    url: "/advertise",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary",
    title: `${title} | ${siteConfig.name}`,
    description,
  },
};

export default function AdvertisePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-4 py-10 sm:px-8 sm:py-16 lg:py-24">
        <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-[#a8e8f5]/70 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-16 -z-10 size-72 rounded-full bg-[#d9f4ee]/75 blur-2xl" />
        <div className="mx-auto grid max-w-6xl gap-8 sm:gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--brand-cyan-accessible)] sm:text-sm">Affiliate partnerships</p>
            <h1 className="mt-3 text-balance font-display text-[clamp(2rem,8vw,3rem)] font-semibold leading-[1.1] tracking-[-0.045em] text-[#063f5b] [overflow-wrap:anywhere] sm:text-5xl lg:text-6xl">Your products. Our recommendations.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#063f5b]/70 sm:mt-6 sm:text-lg sm:leading-8">
              Sell products for babies and families? We welcome brands, online stores, and websites that would like us to feature their products on MishBaby through an affiliate partnership.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#063f5b]/70">
              We promote your products using affiliate links to your store. When someone follows our link and makes a qualifying purchase, we earn a commission on the sale.
            </p>
          </div>
          <div className="min-w-0 rounded-3xl border border-[#063f5b]/8 bg-white p-5 shadow-[0_24px_55px_-38px_rgba(6,63,91,.45)] sm:rounded-[2rem] sm:p-8 xl:p-10">
            <span aria-hidden="true" className="grid size-12 place-items-center rounded-2xl bg-[#e8f8fc] text-[var(--brand-cyan-accessible)] sm:size-14">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <h2 className="mt-4 text-balance font-display text-2xl font-semibold tracking-[-0.04em] text-[#063f5b] sm:mt-6 sm:text-3xl">Let&apos;s work together.</h2>
            <p className="mt-3 text-base leading-7 text-[#063f5b]/70">Interested in having your products featured? Tell us about your affiliate program:</p>
            <a href={`mailto:${email}`} className="mt-2 inline-flex min-h-11 max-w-full items-center text-sm font-bold text-[var(--brand-cyan-accessible)] underline underline-offset-4 [overflow-wrap:anywhere] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#009dcc] sm:mt-4 sm:text-base">{email}</a>
            <a href={emailHref} className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-[#007797] px-4 py-3 text-center text-sm font-extrabold leading-6 text-white transition hover:bg-[#006b88] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#009dcc] sm:mt-6 sm:px-6">Become an affiliate partner</a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <h2 className="text-balance font-display text-2xl font-semibold tracking-[-0.04em] text-[#063f5b] sm:text-3xl">Tell us about your products.</h2>
          <p className="mt-4 text-base leading-7 text-[#063f5b]/70">Send us a few details so we can explore a partnership. Together, we can agree on the products to feature and the commission terms.</p>
        </div>
        <ul className="list-disc space-y-3 pl-5 text-base leading-7 text-[#063f5b]/70 marker:text-[var(--brand-cyan-accessible)]">
          <li>Your brand or website name and a link to your store.</li>
          <li>The products you would like to promote.</li>
          <li>Your affiliate program or network, if you have one.</li>
          <li>Your proposed commission rate and how referrals and sales are tracked.</li>
        </ul>
      </section>
    </>
  );
}
