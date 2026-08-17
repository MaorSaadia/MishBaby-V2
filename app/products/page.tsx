import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/app/components/product-card";
import { getPublishedCategories } from "@/lib/categories";
import { getPublishedProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Baby Products",
  description: "Browse MishBaby's thoughtfully selected baby products and compare available offers from multiple merchants.",
};

type ProductsPageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [resolvedSearchParams, categories, publishedProducts] = await Promise.all([
    searchParams,
    getPublishedCategories(),
    getPublishedProducts(),
  ]);
  const categoryParam = resolvedSearchParams.category;
  const requestedCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const selectedCategory = categories.find((category) => category.slug === requestedCategory);
  const visibleProducts = selectedCategory
    ? publishedProducts.filter((product) => product.categorySlug === selectedCategory.slug)
    : publishedProducts;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-16 sm:px-8 md:py-22">
        <div className="absolute -right-16 -top-16 -z-10 size-80 rounded-full bg-[#a8e8f5]/65 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Shop thoughtful finds</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">Products for the little moments that matter.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#063f5b]/70">Browse our growing collection and compare active offers from trusted marketplaces in one place.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
        <div className="flex flex-col gap-5 border-b border-[#063f5b]/10 pb-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#063f5b]/45">Filter by category</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-[#063f5b]">{selectedCategory?.name ?? "All products"}</h2>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Filter products by category">
            <Link
              href="/products"
              aria-current={!selectedCategory ? "page" : undefined}
              className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${!selectedCategory ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70 hover:border-[#009dcc]/40 hover:text-[#009dcc]"}`}
            >
              All products
            </Link>
            {categories.map((category) => {
              const isSelected = selectedCategory?.slug === category.slug;

              return (
                <Link
                  key={category.slug}
                  href={{ pathname: "/products", query: { category: category.slug } }}
                  aria-current={isSelected ? "page" : undefined}
                  className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${isSelected ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70 hover:border-[#009dcc]/40 hover:text-[#009dcc]"}`}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <p className="mt-8 text-sm font-semibold text-[#063f5b]/55">
          {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}{selectedCategory ? ` in ${selectedCategory.name}` : ""}
        </p>

        {visibleProducts.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[2rem] border border-[#063f5b]/8 bg-[#f7fcfe] px-6 py-12 text-center sm:px-10">
            <h2 className="text-2xl font-extrabold tracking-[-0.035em] text-[#063f5b]">More thoughtful finds are coming</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#063f5b]/60">We have not published products in this category yet. Explore the full collection while we carefully add more.</p>
            <Link href="/products" className="mt-6 inline-flex rounded-full bg-[#009dcc] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0784b0]">View all products</Link>
          </div>
        )}
      </section>
    </>
  );
}
