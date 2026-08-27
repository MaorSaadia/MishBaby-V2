import Link from "next/link";
import { GuideCard } from "./components/guide-card";
import { ProductCard } from "./components/product-card";
import { RecentlyViewedGuides } from "./components/recently-viewed-guides";
import { RecentlyViewedProducts } from "./components/recently-viewed-products";
import { getPublishedCategories } from "@/lib/categories";
import { getCategoryThemeClass } from "@/lib/category-themes";
import { getPublishedGuides } from "@/lib/guides";
import { getHomepageFeaturedProducts } from "@/lib/homepage";

const values = [
  ["✦", "Thoughtfully chosen", "A gentler place to start when everything feels like a decision."],
  ["♡", "Parent-first guidance", "Practical, honest help for the days that don't come with a manual."],
  ["↗", "More ways to shop", "We’re building a clearer way to compare the best places to buy."],
];

export default async function Home() {
  const [categories, featuredProducts, publishedGuides] = await Promise.all([
    getPublishedCategories(),
    getHomepageFeaturedProducts(),
    getPublishedGuides(),
  ]);
  const featuredCategories = categories.slice(0, 3);
  const homepageGuides = publishedGuides.slice(0, 3);

  return (
    <div className="overflow-hidden">
        <section className="relative isolate overflow-hidden bg-[#f1fbfe]">
          <div className="absolute -right-28 top-8 -z-10 size-96 rounded-full bg-[#a8e8f5]/65 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 -z-10 size-72 rounded-full bg-[#c7eff8]/80 blur-2xl" />
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-18 md:grid-cols-[1.08fr_.92fr] md:items-center md:gap-12 md:py-28">
            <div>
              <p className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc] shadow-sm">A softer start for parents</p>
              <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#063f5b] sm:mt-6 sm:text-6xl sm:leading-[1.04]">Good things for your <span className="text-[#009dcc]">little love.</span></h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#063f5b]/70">MishBaby is a thoughtful place to discover baby essentials, helpful advice, and parent-approved finds—without the overwhelm.</p>
              <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
                <Link href="/categories" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#009dcc] px-6 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0784b0]">Start discovering</Link>
                <Link href="#why-mishbaby" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#063f5b]/15 bg-white/70 px-6 py-3.5 text-sm font-extrabold text-[#063f5b] transition hover:border-[#009dcc]">How MishBaby helps</Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-sm md:max-w-md">
              <div className="rounded-3xl bg-[#a8e8f5] p-4 shadow-[0_24px_60px_-28px_rgba(6,63,91,.45)] sm:rounded-[2.5rem] sm:p-5">
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-white/65 bg-[#e8f8fc] p-6 text-center sm:rounded-[2rem] sm:p-8 md:aspect-[4/4.6]">
                  <div>
                    <div className="mx-auto grid size-28 place-items-center rounded-full bg-[#009dcc] text-5xl text-white shadow-sm" aria-hidden="true">♡</div>
                    <p className="mt-5 font-display text-2xl font-semibold leading-tight text-[#063f5b] sm:mt-6 sm:text-3xl">Every little thing, with love.</p>
                    <p className="mt-3 text-sm leading-6 text-[#063f5b]/65">A new home for easier, more confident choices.</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-4 rounded-2xl bg-white px-4 py-3 shadow-lg sm:-left-10">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#009dcc]">Made for you</p>
                <p className="mt-1 text-sm font-extrabold text-[#063f5b]">Simple, useful, kind.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-18 md:py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Explore by category</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#063f5b] sm:text-4xl">Find what fits this little stage.</h2>
            </div>
            <Link href="/categories" className="text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">View all categories <span aria-hidden="true">→</span></Link>
          </div>
          <div className="mt-7 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3">
            {featuredCategories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="group relative min-h-48 overflow-hidden rounded-3xl border border-[#063f5b]/8 bg-white p-6 shadow-[0_16px_36px_-28px_rgba(6,63,91,.45)] transition duration-300 hover:-translate-y-1 sm:min-h-56 sm:rounded-[2rem] sm:p-7">
                <div className={`absolute -right-8 -top-8 grid size-32 place-items-center rounded-full ${getCategoryThemeClass(category.colorTheme)} text-4xl text-[#009dcc] transition-transform duration-300 group-hover:scale-110`} aria-hidden="true">{category.symbol}</div>
                <div className="relative flex h-full max-w-[15rem] flex-col justify-end">
                  <h3 className="text-2xl font-extrabold tracking-[-0.035em] text-[#063f5b]">{category.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#063f5b]/65">{category.description}</p>
                  <span className="mt-4 text-sm font-extrabold text-[#009dcc]">Explore <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-[#f7fcfe] px-4 py-12 sm:px-8 sm:py-18 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Featured picks</p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#063f5b] sm:text-4xl">A few thoughtful places to start.</h2>
              </div>
              <Link href="/products" className="text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">View all products <span aria-hidden="true">→</span></Link>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-4">
              {featuredProducts.map((product) => <ProductCard key={product.id} product={product} variant="compact" />)}
            </div>
          </div>
        </section>

        <RecentlyViewedProducts />

        {homepageGuides.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-18 md:py-24">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Helpful guides</p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#063f5b] sm:text-4xl">A little clarity for the choices ahead.</h2>
                <p className="mt-4 text-base leading-7 text-[#063f5b]/65">Practical, parent-friendly reads to help you feel more informed and prepared.</p>
              </div>
              <Link href="/guides" className="text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">View all guides <span aria-hidden="true">→</span></Link>
            </div>

            <div className="mt-7 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {homepageGuides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}
            </div>
          </section>
        )}

        <RecentlyViewedGuides />

        <section id="why-mishbaby" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 sm:px-8 sm:py-18 md:py-24">
          <div className="max-w-xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">The MishBaby way</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#063f5b] sm:text-4xl">Less searching. More feeling ready.</h2>
          </div>
          <div className="mt-7 grid gap-4 sm:mt-11 sm:gap-5 md:grid-cols-3">
            {values.map(([icon, title, body]) => (
              <article key={title} className="rounded-3xl border border-[#063f5b]/8 bg-white p-5 shadow-[0_12px_30px_-24px_rgba(6,63,91,.45)] sm:p-7">
                <span className="grid size-11 place-items-center rounded-2xl bg-[#e2f7fc] text-xl text-[#009dcc]" aria-hidden="true">{icon}</span>
                <h3 className="mt-4 text-lg font-extrabold text-[#063f5b] sm:mt-6">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#063f5b]/65">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-18 md:pb-24">
          <div className="rounded-3xl bg-[#063f5b] px-6 py-9 text-center text-white sm:rounded-[2rem] sm:px-12 sm:py-12">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a8e8f5]">Made for growing families</p>
            <h2 className="mx-auto mt-3 max-w-xl font-display text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">A more helpful way to find what your family needs.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/70">Explore thoughtful recommendations and see the places each product will be available.</p>
            <Link href="/categories" className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#063f5b] transition hover:bg-[#e8f8fc] sm:w-auto">Browse all categories</Link>
          </div>
        </section>
    </div>
  );
}
