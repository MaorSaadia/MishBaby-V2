import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedCategories } from "@/lib/categories";
import { getCategoryThemeClass } from "@/lib/category-themes";
import { siteConfig } from "@/lib/site";
import { createBreadcrumbStructuredData, createItemListStructuredData, serializeStructuredData } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Baby Product Categories",
  description: "Explore baby essentials, feeding, nursery, care, safety, and play categories from MishBaby.",
  alternates: {
    canonical: "/categories",
  },
};

export default async function CategoriesPage() {
  const categories = await getPublishedCategories();
  const structuredData = categories.length > 0
    ? createItemListStructuredData({
        id: `${siteConfig.url}/categories#category-list`,
        name: "MishBaby baby product categories",
        url: `${siteConfig.url}/categories`,
        items: categories.map((category) => ({
          type: "CollectionPage",
          name: category.name,
          description: category.description,
          url: `${siteConfig.url}/categories/${category.slug}`,
        })),
      })
    : undefined;
  const breadcrumbStructuredData = createBreadcrumbStructuredData(
    `${siteConfig.url}/categories#breadcrumb`,
    [
      { name: "Home", url: siteConfig.url },
      { name: "Categories", url: `${siteConfig.url}/categories` },
    ],
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeStructuredData(breadcrumbStructuredData) }}
      />
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }}
        />
      )}
        <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-10 sm:px-8 sm:py-14 md:py-22">
          <div className="absolute -right-16 -top-16 -z-10 size-80 rounded-full bg-[#a8e8f5]/65 blur-3xl" />
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc] sm:text-sm">Explore by category</p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#063f5b] sm:text-6xl sm:leading-[1.05]">A thoughtful start for every little stage.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#063f5b]/70 sm:mt-5 sm:text-lg sm:leading-8">Find the baby essentials, everyday helpers, and joyful discoveries that fit your family right now.</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 md:py-20">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="group relative min-h-56 overflow-hidden rounded-3xl border border-[#063f5b]/8 bg-white p-6 shadow-[0_16px_36px_-28px_rgba(6,63,91,.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_42px_-26px_rgba(6,63,91,.35)] sm:min-h-70 sm:rounded-[2rem] sm:p-7">
                <div className={`absolute -right-7 -top-7 grid size-30 place-items-center rounded-full ${getCategoryThemeClass(category.colorTheme)} text-4xl text-[#009dcc] transition-transform duration-300 group-hover:scale-110 sm:-right-8 sm:-top-8 sm:size-36 sm:text-5xl`} aria-hidden="true">{category.symbol}</div>
                <div className="relative flex h-full flex-col justify-end">
                  <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Discover</span>
                  <h2 className="mt-3 text-xl font-extrabold tracking-[-0.035em] text-[#063f5b] sm:text-2xl">{category.name}</h2>
                  <p className="mt-2 max-w-[15rem] text-sm leading-6 text-[#063f5b]/65">{category.description}</p>
                  <span className="mt-5 text-sm font-extrabold text-[#009dcc]">Explore category <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
          {categories.length === 0 && (
            <div className="rounded-3xl border border-[#063f5b]/8 bg-[#f7fcfe] px-6 py-10 text-center">
              <h2 className="text-xl font-extrabold text-[#063f5b]">Categories are being prepared</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#063f5b]/65">Please check back soon for thoughtfully organized baby-product discoveries.</p>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-16 md:pb-22">
          <div className="rounded-3xl bg-[#063f5b] px-6 py-9 text-center text-white sm:rounded-[2rem] sm:px-12 sm:py-11">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a8e8f5]">Growing with you</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-2xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">More useful finds and helpful guidance are on the way.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/70">We’re building each category thoughtfully, so you can spend less time searching and more time with your little one.</p>
          </div>
        </section>
    </>
  );
}
