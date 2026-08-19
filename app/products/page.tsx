import type { Metadata } from "next";
import Link from "next/link";
import { ProductResults } from "@/app/products/product-results";
import { getPublishedCategories } from "@/lib/categories";
import { getPublishedProducts } from "@/lib/products";

const productsMetadata: Metadata = {
  title: "Baby Products",
  description: "Browse MishBaby's thoughtfully selected baby products and compare available offers from multiple merchants.",
};

type ProductsPageProps = {
  searchParams: Promise<{ category?: string | string[]; q?: string | string[]; sort?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const hasFilteredParams = ["category", "q", "sort"].some((key) =>
    Object.prototype.hasOwnProperty.call(resolvedSearchParams, key),
  );

  return {
    ...productsMetadata,
    alternates: {
      canonical: "/products",
    },
    robots: {
      index: !hasFilteredParams,
      follow: true,
    },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [resolvedSearchParams, categories, publishedProducts] = await Promise.all([
    searchParams,
    getPublishedCategories(),
    getPublishedProducts(),
  ]);
  const categoryParam = resolvedSearchParams.category;
  const requestedCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const searchParam = resolvedSearchParams.q;
  const requestedSearch = Array.isArray(searchParam) ? searchParam[0] : searchParam;
  const searchQuery = requestedSearch?.trim() ?? "";
  const normalizedSearch = searchQuery.toLocaleLowerCase();
  const sortParam = resolvedSearchParams.sort;
  const requestedSort = Array.isArray(sortParam) ? sortParam[0] : sortParam;
  const selectedSort = requestedSort === "name" ? "name" : "newest";
  const selectedCategory = categories.find((category) => category.slug === requestedCategory);
  const categoryProducts = selectedCategory
    ? publishedProducts.filter((product) => product.categorySlug === selectedCategory.slug)
    : publishedProducts;
  const matchingProducts = normalizedSearch
    ? categoryProducts.filter((product) =>
        [product.name, product.summary, ...product.highlights].some((value) =>
          value.toLocaleLowerCase().includes(normalizedSearch),
        ),
      )
    : categoryProducts;
  const visibleProducts = selectedSort === "name"
    ? [...matchingProducts].sort((firstProduct, secondProduct) => firstProduct.name.localeCompare(secondProduct.name))
    : matchingProducts;
  const selectedSortQuery = selectedSort === "name" ? { sort: "name" } : {};

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
              href={{
                pathname: "/products",
                query: { ...(searchQuery ? { q: searchQuery } : {}), ...selectedSortQuery },
              }}
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
                  href={{
                    pathname: "/products",
                    query: {
                      category: category.slug,
                      ...(searchQuery ? { q: searchQuery } : {}),
                      ...selectedSortQuery,
                    },
                  }}
                  aria-current={isSelected ? "page" : undefined}
                  className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${isSelected ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70 hover:border-[#009dcc]/40 hover:text-[#009dcc]"}`}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#063f5b]/55">
            {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}
            {selectedCategory ? ` in ${selectedCategory.name}` : ""}
            {searchQuery ? ` matching “${searchQuery}”` : ""}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {searchQuery && (
              <Link
                href={{
                  pathname: "/products",
                  query: {
                    ...(selectedCategory ? { category: selectedCategory.slug } : {}),
                    ...selectedSortQuery,
                  },
                }}
                className="text-sm font-extrabold text-[#009dcc] transition hover:text-[#0784b0]"
              >
                Clear search
              </Link>
            )}
            <nav className="flex items-center gap-1 rounded-full border border-[#063f5b]/10 bg-white p-1" aria-label="Sort products">
              <span className="px-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#063f5b]/40">Sort</span>
              <Link
                href={{
                  pathname: "/products",
                  query: {
                    ...(selectedCategory ? { category: selectedCategory.slug } : {}),
                    ...(searchQuery ? { q: searchQuery } : {}),
                  },
                }}
                aria-current={selectedSort === "newest" ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-xs font-extrabold transition ${selectedSort === "newest" ? "bg-[#009dcc] text-white" : "text-[#063f5b]/60 hover:bg-[#e8f8fc] hover:text-[#009dcc]"}`}
              >
                Newest
              </Link>
              <Link
                href={{
                  pathname: "/products",
                  query: {
                    ...(selectedCategory ? { category: selectedCategory.slug } : {}),
                    ...(searchQuery ? { q: searchQuery } : {}),
                    sort: "name",
                  },
                }}
                aria-current={selectedSort === "name" ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-xs font-extrabold transition ${selectedSort === "name" ? "bg-[#009dcc] text-white" : "text-[#063f5b]/60 hover:bg-[#e8f8fc] hover:text-[#009dcc]"}`}
              >
                A–Z
              </Link>
            </nav>
          </div>
        </div>

        {visibleProducts.length > 0 ? (
          <ProductResults
            key={`${selectedCategory?.slug ?? "all"}:${searchQuery}:${selectedSort}`}
            products={visibleProducts}
          />
        ) : (
          <div className="mt-6 rounded-[2rem] border border-[#063f5b]/8 bg-[#f7fcfe] px-6 py-12 text-center sm:px-10">
            <h2 className="text-2xl font-extrabold tracking-[-0.035em] text-[#063f5b]">
              {searchQuery ? "No products matched your search" : "More thoughtful finds are coming"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#063f5b]/60">
              {searchQuery
                ? "Try a shorter product name, a different benefit, or clear the search to browse everything."
                : "We have not published products in this category yet. Explore the full collection while we carefully add more."}
            </p>
            <Link
              href={{
                pathname: "/products",
                query: {
                  ...(selectedCategory && searchQuery ? { category: selectedCategory.slug } : {}),
                  ...selectedSortQuery,
                },
              }}
              className="mt-6 inline-flex rounded-full bg-[#009dcc] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0784b0]"
            >
              {searchQuery ? "Clear search" : "View all products"}
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
