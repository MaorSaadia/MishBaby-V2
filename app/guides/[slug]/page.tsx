import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedGuide, publishedGuides } from "../guide-data";

export function generateStaticParams() {
  return publishedGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getPublishedGuide(slug);

  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
  };
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = getPublishedGuide(slug);

  if (!guide) notFound();

  return (
    <>
        <header className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-12 sm:px-8 md:py-20">
          <div className="absolute -right-20 -top-20 -z-10 size-96 rounded-full bg-[#a8e8f5]/70 blur-3xl" />
          <div className="mx-auto max-w-4xl">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#063f5b]/55">
              <Link href="/" className="hover:text-[#009dcc]">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/guides" className="hover:text-[#009dcc]">Guides</Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#063f5b]">{guide.title}</span>
            </nav>
            <div className="mt-10 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.12em]">
              <span className="rounded-full bg-white px-3 py-1.5 text-[#009dcc] shadow-sm">{guide.category}</span>
              <span className="text-[#063f5b]/45">{guide.readingTime}</span>
            </div>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">{guide.title}</h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-[#063f5b]/70">{guide.description}</p>
          </div>
        </header>

        <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 md:py-20">
          <p className="font-display text-2xl leading-10 text-[#063f5b]">{guide.introduction}</p>

          <aside className="mt-10 rounded-3xl border border-[#009dcc]/15 bg-[#e8f8fc] p-6 text-sm leading-6 text-[#063f5b]/70">
            Every baby, caregiver, and outing is different. Use this as a starting point and adapt it to your baby’s needs, the weather, and the guidance you already follow.
          </aside>

          <div className="mt-14 grid gap-14">
            {guide.sections.map((section, index) => (
              <section key={section.heading}>
                <div className="flex items-start gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e2f7fc] text-sm font-extrabold text-[#009dcc]">{index + 1}</span>
                  <h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#063f5b]">{section.heading}</h2>
                </div>
                <div className="mt-5 grid gap-5 text-base leading-8 text-[#063f5b]/70">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                {section.items && (
                  <ul className="mt-6 grid gap-3 rounded-3xl bg-[#f7fcfe] p-6">
                    {section.items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[#063f5b]/70"><span className="mt-2 grid size-4 shrink-0 place-items-center rounded-full bg-[#009dcc] text-[9px] font-black text-white">✓</span>{item}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <section className="mt-16 rounded-[2rem] bg-[#063f5b] px-7 py-9 text-white sm:px-9">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a8e8f5]">Ready to explore?</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">Find thoughtful essentials for everyday outings.</h2>
            <Link href={`/categories/${guide.relatedCategory.slug}`} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#063f5b] transition hover:bg-[#e8f8fc]">Explore {guide.relatedCategory.label}</Link>
          </section>
        </article>
    </>
  );
}
