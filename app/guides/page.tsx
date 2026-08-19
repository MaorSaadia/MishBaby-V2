import type { Metadata } from "next";
import Link from "next/link";
import { GuideImage } from "@/app/components/guide-image";
import { getGuides, type Guide } from "@/lib/guides";

const guidesMetadata: Metadata = {
  title: "Parenting & Buying Guides",
  description: "Practical parenting guidance and thoughtful baby-product buying guides from MishBaby.",
};

type GuidesPageProps = {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: GuidesPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const hasFilteredParams = ["category", "q"].some((key) =>
    Object.prototype.hasOwnProperty.call(resolvedSearchParams, key),
  );

  return {
    ...guidesMetadata,
    alternates: {
      canonical: "/guides",
    },
    robots: {
      index: !hasFilteredParams,
      follow: true,
    },
  };
}

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-white shadow-[0_16px_36px_-28px_rgba(6,63,91,.4)]">
      <GuideImage guide={guide} variant="card" />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#009dcc]">{guide.categoryLabel}</p>
          {guide.readingMinutes && <span className="text-xs font-bold text-[#063f5b]/40">{guide.readingMinutes} min read</span>}
        </div>
        <h3 className="mt-3 text-xl font-extrabold leading-snug tracking-[-0.03em] text-[#063f5b]">{guide.title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#063f5b]/65">{guide.description}</p>
        {guide.status === "published" ? (
          <Link href={`/guides/${guide.slug}`} className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#009dcc] transition hover:text-[#0784b0]">
            Read the guide <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <p className="mt-5 text-xs font-extrabold text-[#063f5b]/45">In preparation</p>
        )}
      </div>
    </article>
  );
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const [resolvedSearchParams, guides] = await Promise.all([searchParams, getGuides()]);
  const categoryParam = resolvedSearchParams.category;
  const requestedCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const searchParam = resolvedSearchParams.q;
  const requestedSearch = Array.isArray(searchParam) ? searchParam[0] : searchParam;
  const searchQuery = requestedSearch?.trim() ?? "";
  const normalizedSearch = searchQuery.toLocaleLowerCase();
  const categoryLabels = [...new Set(guides.map((guide) => guide.categoryLabel))]
    .sort((first, second) => first.localeCompare(second));
  const selectedCategory = categoryLabels.find(
    (categoryLabel) => categoryLabel.toLocaleLowerCase() === requestedCategory?.toLocaleLowerCase(),
  );
  const matchingGuides = guides.filter((guide) => {
    if (selectedCategory && guide.categoryLabel !== selectedCategory) return false;
    if (!normalizedSearch) return true;

    const searchableValues = [
      guide.title,
      guide.description,
      guide.categoryLabel,
      guide.introduction ?? "",
      ...guide.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...section.items]),
    ];

    return searchableValues.some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
  });
  const hasActiveFilters = Boolean(selectedCategory || searchQuery);
  const featuredGuide = hasActiveFilters ? undefined : guides[0];
  const moreGuides = hasActiveFilters ? matchingGuides : guides.slice(1);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-16 sm:px-8 md:py-22">
        <div className="absolute -right-20 -top-20 -z-10 size-96 rounded-full bg-[#a8e8f5]/70 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 -z-10 size-72 rounded-full bg-[#d9f4ee]/70 blur-2xl" />
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">MishBaby guides</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">Practical guidance, minus the noise.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#063f5b]/70">Clear buying guides, useful checklists, and friendly ideas to help you make confident choices for your family.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-12 sm:px-8 md:pt-16">
        <div className="rounded-[2rem] border border-[#063f5b]/8 bg-white p-5 shadow-[0_18px_40px_-34px_rgba(6,63,91,.4)] sm:p-7">
          <form action="/guides" className="flex flex-col gap-3 sm:flex-row" role="search">
            <label htmlFor="guide-search" className="sr-only">Search guides</label>
            <div className="relative flex-1">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#063f5b]/40">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="guide-search"
                type="search"
                name="q"
                defaultValue={searchQuery}
                maxLength={120}
                placeholder="Search guides, checklists, and topics..."
                className="h-13 w-full rounded-2xl border border-[#063f5b]/12 bg-[#fbfeff] pl-12 pr-4 text-sm font-semibold text-[#063f5b] outline-none transition placeholder:font-medium placeholder:text-[#063f5b]/40 focus:border-[#009dcc] focus:ring-3 focus:ring-[#009dcc]/12"
              />
              {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
            </div>
            <button type="submit" className="h-13 rounded-2xl bg-[#009dcc] px-6 text-sm font-extrabold text-white transition hover:bg-[#0784b0]">Search guides</button>
          </form>

          <div className="mt-6 border-t border-[#063f5b]/8 pt-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#063f5b]/45">Filter by topic</p>
            <nav className="mt-3 flex flex-wrap gap-2" aria-label="Filter guides by topic">
              <Link
                href={{ pathname: "/guides", query: searchQuery ? { q: searchQuery } : {} }}
                aria-current={!selectedCategory ? "page" : undefined}
                className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${!selectedCategory ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70 hover:border-[#009dcc]/40 hover:text-[#009dcc]"}`}
              >
                All guides
              </Link>
              {categoryLabels.map((categoryLabel) => {
                const isSelected = selectedCategory === categoryLabel;

                return (
                  <Link
                    key={categoryLabel}
                    href={{
                      pathname: "/guides",
                      query: { category: categoryLabel, ...(searchQuery ? { q: searchQuery } : {}) },
                    }}
                    aria-current={isSelected ? "page" : undefined}
                    className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${isSelected ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70 hover:border-[#009dcc]/40 hover:text-[#009dcc]"}`}
                  >
                    {categoryLabel}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-16">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#063f5b]/55">
            {matchingGuides.length} {matchingGuides.length === 1 ? "guide" : "guides"}
            {selectedCategory ? ` in ${selectedCategory}` : ""}
            {searchQuery ? ` matching “${searchQuery}”` : ""}
          </p>
          {hasActiveFilters && <Link href="/guides" className="text-sm font-extrabold text-[#009dcc] transition hover:text-[#0784b0]">Clear filters</Link>}
        </div>

        {featuredGuide && (
          <div className="grid overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-white shadow-[0_20px_48px_-34px_rgba(6,63,91,.4)] md:grid-cols-[.85fr_1.15fr]">
            <GuideImage guide={featuredGuide} variant="featured" priority />
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#e8f8fc] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[#009dcc]">Featured guide</span>
                <span className="text-xs font-bold text-[#063f5b]/45">{featuredGuide.categoryLabel}</span>
              </div>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-[-0.045em] text-[#063f5b]">{featuredGuide.title}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#063f5b]/65">{featuredGuide.description}</p>
              {featuredGuide.status === "published" && (
                <Link href={`/guides/${featuredGuide.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">
                  Read the guide <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {moreGuides.length > 0 && (
          <div className={`${featuredGuide ? "mt-10" : ""} grid gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
            {moreGuides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}
          </div>
        )}

        {matchingGuides.length === 0 && (
          <div className="rounded-[2rem] border border-[#063f5b]/8 bg-[#f7fcfe] px-6 py-12 text-center sm:px-10">
            <h2 className="text-2xl font-extrabold tracking-[-0.035em] text-[#063f5b]">No guides matched your search</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#063f5b]/60">Try a shorter topic, choose another category, or clear the filters to browse every guide.</p>
            <Link href="/guides" className="mt-6 inline-flex rounded-full bg-[#009dcc] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0784b0]">View all guides</Link>
          </div>
        )}
      </section>

      <section className="bg-[#f7fcfe] px-5 py-16 sm:px-8 md:py-22">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-[#063f5b] px-7 py-10 text-white sm:px-10 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a8e8f5]">Prefer to browse products?</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">Discover thoughtful finds by category.</h2>
          </div>
          <Link href="/categories" className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#063f5b] transition hover:bg-[#e8f8fc]">Explore categories</Link>
        </div>
      </section>
    </>
  );
}
