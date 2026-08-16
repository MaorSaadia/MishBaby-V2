import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "../../components/product-card";
import { getOffersForProduct, getProductsByCategory } from "@/lib/products";
import { categories, getCategory } from "../category-data";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category) return {};

  return {
    title: `${category.name} | MishBaby`,
    description: category.introduction,
  };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category) notFound();

  const featuredProducts = getProductsByCategory(category.slug);

  return (
    <>
        <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-12 sm:px-8 md:py-20">
          <div className={`absolute -right-20 -top-24 -z-10 size-96 rounded-full ${category.color} blur-2xl`} />
          <div className="mx-auto max-w-6xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-bold text-[#063f5b]/55">
              <Link href="/" className="hover:text-[#009dcc]">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/categories" className="hover:text-[#009dcc]">Categories</Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#063f5b]">{category.name}</span>
            </nav>
            <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">MishBaby category</p>
                <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">{category.name}</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#063f5b]/70">{category.introduction}</p>
              </div>
              <div className={`grid size-40 place-items-center rounded-[2.5rem] ${category.color} text-6xl text-[#009dcc] shadow-[0_20px_45px_-30px_rgba(6,63,91,.4)] sm:size-48`} aria-hidden="true">{category.symbol}</div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Inside this category</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">Start with what matters today.</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {category.topics.map((topic, index) => (
              <article key={topic} className="rounded-3xl border border-[#063f5b]/8 bg-white p-6 shadow-[0_12px_30px_-25px_rgba(6,63,91,.35)]">
                <span className="grid size-9 place-items-center rounded-full bg-[#e2f7fc] text-sm font-extrabold text-[#009dcc]">0{index + 1}</span>
                <h3 className="mt-6 text-lg font-extrabold text-[#063f5b]">{topic}</h3>
                <p className="mt-2 text-sm leading-6 text-[#063f5b]/60">Thoughtful recommendations and practical guidance will live here.</p>
              </article>
            ))}
          </div>
        </section>

        {featuredProducts.length > 0 && (
          <section className="bg-[#f7fcfe] px-5 py-14 sm:px-8 md:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-2xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Product card preview</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">A first look at thoughtful finds.</h2>
                <p className="mt-4 text-base leading-7 text-[#063f5b]/65">These sample products help us shape how recommendations and multiple merchant offers will appear.</p>
              </div>
              <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product) => <ProductCard key={product.id} product={product} offers={getOffersForProduct(product.id)} />)}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 md:pb-22">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-[#063f5b] px-7 py-10 text-white sm:px-10 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a8e8f5]">Category foundation</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">More thoughtful recommendations are on the way.</h2>
            </div>
            <Link href="/categories" className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#063f5b] transition hover:bg-[#e8f8fc]">View all categories</Link>
          </div>
        </section>
    </>
  );
}
