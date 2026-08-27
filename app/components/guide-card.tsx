import Link from "next/link";
import type { Guide } from "@/lib/guides";
import { CardFavoriteButton } from "./card-favorite-button";
import { GuideImage } from "./guide-image";

export function GuideCard({ guide, variant = "card" }: { guide: Guide; variant?: "card" | "related" }) {
  return <article className="group relative overflow-hidden rounded-3xl border border-[#063f5b]/8 bg-white shadow-[0_16px_36px_-28px_rgba(6,63,91,.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_42px_-26px_rgba(6,63,91,.35)] sm:rounded-[2rem]">
    {guide.status === "published" && <Link href={`/guides/${guide.slug}`} aria-label={`Read ${guide.title}`} className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#009dcc]" />}
    {guide.status === "published" && <div className="absolute right-4 top-4 z-20"><CardFavoriteButton kind="guide" id={guide.id} label={guide.title} /></div>}
    <GuideImage guide={guide} variant={variant} />
    <div className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3 text-xs font-bold"><span className="uppercase tracking-[0.12em] text-[#009dcc]">{guide.categoryLabel}</span>{guide.readingMinutes && <span className="text-[#063f5b]/45">{guide.readingMinutes} min read</span>}</div>
      <h3 className="mt-3 text-lg font-extrabold leading-snug tracking-[-0.03em] text-[#063f5b] sm:text-xl">{guide.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#063f5b]/65">{guide.description}</p>
      {guide.status === "published" ? <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#009dcc] transition group-hover:text-[#0784b0]">Read the guide <span aria-hidden="true">&rarr;</span></span> : <p className="mt-5 text-xs font-extrabold text-[#063f5b]/45">In preparation</p>}
    </div>
  </article>;
}
