import Link from "next/link";
import { ProductCard } from "./components/product-card";
import { getPublishedCategories } from "@/lib/categories";
import { getCategoryThemeClass } from "@/lib/category-themes";
import { getPublishedProducts } from "@/lib/products";

const values = [
  ["✦", "Thoughtfully chosen", "A gentler place to start when everything feels like a decision."],
  ["♡", "Parent-first guidance", "Practical, honest help for the days that don't come with a manual."],
  ["↗", "More ways to shop", "We’re building a clearer way to compare the best places to buy."],
];

export default async function Home() {
  const [categories, products] = await Promise.all([getPublishedCategories(), getPublishedProducts()]);
  const featuredCategories = categories.slice(0, 3);
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="overflow-hidden">
        <section className="relative isolate overflow-hidden bg-[#f1fbfe]">
          <div className="absolute -right-28 top-8 -z-10 size-96 rounded-full bg-[#a8e8f5]/65 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 -z-10 size-72 rounded-full bg-[#c7eff8]/80 blur-2xl" />
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-18 sm:px-8 md:grid-cols-[1.08fr_.92fr] md:items-center md:py-28">
            <div>
              <p className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc] shadow-sm">A softer start for parents</p>
              <h1 className="mt-6 max-w-2xl font-display text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">Good things for your <span className="text-[#009dcc]">little love.</span></h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#063f5b]/70">MishBaby is a thoughtful place to discover baby essentials, helpful advice, and parent-approved finds—without the overwhelm.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/categories" className="rounded-full bg-[#009dcc] px-6 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0784b0]">Start discovering</Link>
                <Link href="#why-mishbaby" className="rounded-full border border-[#063f5b]/15 bg-white/70 px-6 py-3.5 text-sm font-extrabold text-[#063f5b] transition hover:border-[#009dcc]">How MishBaby helps</Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <div className="rounded-[2.5rem] bg-[#a8e8f5] p-5 shadow-[0_24px_60px_-28px_rgba(6,63,91,.45)]">
                <div className="flex aspect-[4/4.6] items-center justify-center rounded-[2rem] border border-white/65 bg-[#e8f8fc] p-8 text-center">
                  <div>
                    <div className="mx-auto grid size-28 place-items-center rounded-full bg-[#009dcc] text-5xl text-white shadow-sm" aria-hidden="true">♡</div>
                    <p className="mt-6 font-display text-3xl font-semibold leading-tight text-[#063f5b]">Every little thing, with love.</p>
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

        <section className="mx-auto max-w-6xl px-5 py-18 sm:px-8 md:py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Explore by category</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">Find what fits this little stage.</h2>
            </div>
            <Link href="/categories" className="text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">View all categories <span aria-hidden="true">→</span></Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featuredCategories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="group relative min-h-56 overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-white p-7 shadow-[0_16px_36px_-28px_rgba(6,63,91,.45)] transition duration-300 hover:-translate-y-1">
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

        <section className="bg-[#f7fcfe] px-5 py-18 sm:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Featured picks</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">A few thoughtful places to start.</h2>
              </div>
              <Link href="/products" className="text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">View all products <span aria-hidden="true">→</span></Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>

        <section id="why-mishbaby" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-18 sm:px-8 md:py-24">
          <div className="max-w-xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">The MishBaby way</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">Less searching. More feeling ready.</h2>
          </div>
          <div className="mt-11 grid gap-5 md:grid-cols-3">
            {values.map(([icon, title, body]) => (
              <article key={title} className="rounded-3xl border border-[#063f5b]/8 bg-white p-7 shadow-[0_12px_30px_-24px_rgba(6,63,91,.45)]">
                <span className="grid size-11 place-items-center rounded-2xl bg-[#e2f7fc] text-xl text-[#009dcc]" aria-hidden="true">{icon}</span>
                <h3 className="mt-6 text-lg font-extrabold text-[#063f5b]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#063f5b]/65">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-18 sm:px-8 md:pb-24">
          <div className="rounded-[2rem] bg-[#063f5b] px-7 py-12 text-center text-white sm:px-12">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a8e8f5]">Made for growing families</p>
            <h2 className="mx-auto mt-3 max-w-xl font-display text-4xl font-semibold leading-tight tracking-[-0.045em]">A more helpful way to find what your family needs.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/70">Explore thoughtful recommendations and see the places each product will be available.</p>
            <Link href="/categories" className="mt-7 inline-flex rounded-full bg-white px-6 py-3 text-sm font-extrabold text-[#063f5b] transition hover:bg-[#e8f8fc]">Browse all categories</Link>
          </div>
        </section>
    </div>
  );
}
