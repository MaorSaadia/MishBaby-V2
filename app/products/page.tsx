import type { Metadata } from "next";
import Link from "next/link";
import { MobileProductFilters } from "@/app/products/mobile-product-filters";
import { ProductResults } from "@/app/products/product-results";
import { productsPerBatch } from "@/lib/catalog-display";
import { getPublishedCategories } from "@/lib/categories";
import { getHomepageFeaturedProducts } from "@/lib/homepage";
import { getPublishedProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";
import { createItemListStructuredData, serializeStructuredData } from "@/lib/structured-data";

const productsMetadata: Metadata = {
  title: "Baby Products",
  description: "Browse MishBaby's thoughtfully selected baby products and compare available offers from multiple merchants.",
};

type ProductsPageProps = {
  searchParams: Promise<{ category?: string | string[]; merchant?: string | string[]; q?: string | string[]; sort?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const hasFilteredParams = ["category", "merchant", "q", "sort"].some((key) =>
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
  const [resolvedSearchParams, categories, publishedProducts, featuredProducts] = await Promise.all([
    searchParams,
    getPublishedCategories(),
    getPublishedProducts(),
    getHomepageFeaturedProducts(),
  ]);
  const categoryParam = resolvedSearchParams.category;
  const requestedCategory = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
  const searchParam = resolvedSearchParams.q;
  const requestedSearch = Array.isArray(searchParam) ? searchParam[0] : searchParam;
  const searchQuery = requestedSearch?.trim() ?? "";
  const normalizedSearch = searchQuery.toLocaleLowerCase();
  const merchantParam = resolvedSearchParams.merchant;
  const requestedMerchant = Array.isArray(merchantParam) ? merchantParam[0] : merchantParam;
  const sortParam = resolvedSearchParams.sort;
  const requestedSort = Array.isArray(sortParam) ? sortParam[0] : sortParam;
  const selectedSort = requestedSort === "name" || requestedSort === "featured" ? requestedSort : "newest";
  const hasCatalogParams = ["category", "merchant", "q", "sort"].some((key) =>
    Object.prototype.hasOwnProperty.call(resolvedSearchParams, key),
  );
  const merchantsById = new Map(
    publishedProducts.flatMap((product) => product.offers.map((offer) => [offer.merchant.id, offer.merchant] as const)),
  );
  const merchants = [...merchantsById.values()].sort((firstMerchant, secondMerchant) => firstMerchant.name.localeCompare(secondMerchant.name));
  const selectedMerchant = merchants.find((merchant) => merchant.id === requestedMerchant);
  const selectedCategory = categories.find((category) => category.slug === requestedCategory);
  const categoryProducts = selectedCategory
    ? publishedProducts.filter((product) => product.categorySlug === selectedCategory.slug)
    : publishedProducts;
  const merchantProducts = selectedMerchant
    ? categoryProducts.filter((product) => product.offers.some((offer) => offer.merchant.id === selectedMerchant.id))
    : categoryProducts;
  const matchingProducts = normalizedSearch
    ? merchantProducts.filter((product) =>
        [product.name, product.summary, ...product.highlights].some((value) =>
          value.toLocaleLowerCase().includes(normalizedSearch),
        ),
      )
    : merchantProducts;
  const featuredProductRanks = new Map(featuredProducts.map((product, index) => [product.id, index]));
  const visibleProducts = selectedSort === "name"
    ? [...matchingProducts].sort((firstProduct, secondProduct) => firstProduct.name.localeCompare(secondProduct.name))
    : selectedSort === "featured"
      ? [...matchingProducts].sort((firstProduct, secondProduct) =>
          (featuredProductRanks.get(firstProduct.id) ?? Number.MAX_SAFE_INTEGER)
          - (featuredProductRanks.get(secondProduct.id) ?? Number.MAX_SAFE_INTEGER),
        )
      : matchingProducts;
  const selectedCategoryQuery = selectedCategory ? { category: selectedCategory.slug } : {};
  const selectedMerchantQuery = selectedMerchant ? { merchant: selectedMerchant.id } : {};
  const selectedSearchQuery = searchQuery ? { q: searchQuery } : {};
  const selectedSortQuery = selectedSort === "newest" ? {} : { sort: selectedSort };
  const structuredData = !hasCatalogParams && visibleProducts.length > 0
    ? createItemListStructuredData({
        id: `${siteConfig.url}/products#product-list`,
        name: "MishBaby baby products",
        url: `${siteConfig.url}/products`,
        items: visibleProducts.slice(0, productsPerBatch).map((product) => ({
          type: "Product",
          name: product.name,
          description: product.summary,
          url: `${siteConfig.url}/products/${product.slug}`,
          image: product.image?.src,
        })),
      })
    : undefined;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }}
        />
      )}
      <section className="relative isolate overflow-hidden border-b border-[#063f5b]/8 bg-[#f1fbfe] px-5 py-8 sm:px-8 sm:py-10">
        <div className="absolute -right-16 -top-28 -z-10 size-72 rounded-full bg-[#a8e8f5]/65 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Shop thoughtful finds</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-[-0.05em] text-[#063f5b] sm:text-5xl">Baby products</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#063f5b]/70 sm:text-lg">Browse thoughtful finds and compare active offers from trusted marketplaces.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-6 sm:px-8 md:py-8">
        <div className="rounded-[1.5rem] border border-[#063f5b]/10 bg-[#f7fcfe] p-3 sm:p-4 md:p-5">
          <MobileProductFilters
            categories={categories.map((category) => ({ id: category.slug, name: category.name }))}
            merchants={merchants.map((merchant) => ({ id: merchant.id, name: merchant.name }))}
            selectedCategoryId={selectedCategory?.slug}
            selectedMerchantId={selectedMerchant?.id}
            searchQuery={searchQuery}
            selectedSort={selectedSort}
          />

          <div className="hidden space-y-3 md:block">
            <div className="flex items-start gap-4">
              <p className="w-20 shrink-0 pt-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#063f5b]/45">Category</p>
              <nav className="flex flex-wrap gap-2" aria-label="Filter products by category">
                <Link
                  href={{
                    pathname: "/products",
                    query: { ...selectedMerchantQuery, ...selectedSearchQuery, ...selectedSortQuery },
                  }}
                  aria-current={!selectedCategory ? "page" : undefined}
                  className={`rounded-full px-3.5 py-2 text-sm font-extrabold transition ${!selectedCategory ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70 hover:border-[#009dcc]/40 hover:text-[#009dcc]"}`}
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
                          ...selectedMerchantQuery,
                          ...selectedSearchQuery,
                          ...selectedSortQuery,
                        },
                      }}
                      aria-current={isSelected ? "page" : undefined}
                      className={`rounded-full px-3.5 py-2 text-sm font-extrabold transition ${isSelected ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70 hover:border-[#009dcc]/40 hover:text-[#009dcc]"}`}
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {merchants.length > 0 && (
              <div className="flex items-start gap-4 border-t border-[#063f5b]/8 pt-3">
                <p className="w-20 shrink-0 pt-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#063f5b]/45">Merchant</p>
                <nav className="flex flex-wrap gap-2" aria-label="Filter products by merchant">
                  <Link
                    href={{
                      pathname: "/products",
                      query: { ...selectedCategoryQuery, ...selectedSearchQuery, ...selectedSortQuery },
                    }}
                    aria-current={!selectedMerchant ? "page" : undefined}
                    className={`rounded-full px-3.5 py-2 text-sm font-extrabold transition ${!selectedMerchant ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70 hover:border-[#009dcc]/40 hover:text-[#009dcc]"}`}
                  >
                    All merchants
                  </Link>
                  {merchants.map((merchant) => {
                    const isSelected = selectedMerchant?.id === merchant.id;

                    return (
                      <Link
                        key={merchant.id}
                        href={{
                          pathname: "/products",
                          query: {
                            ...selectedCategoryQuery,
                            merchant: merchant.id,
                            ...selectedSearchQuery,
                            ...selectedSortQuery,
                          },
                        }}
                        aria-current={isSelected ? "page" : undefined}
                        className={`rounded-full px-3.5 py-2 text-sm font-extrabold transition ${isSelected ? "bg-[#009dcc] text-white" : "border border-[#063f5b]/10 bg-white text-[#063f5b]/70 hover:border-[#009dcc]/40 hover:text-[#009dcc]"}`}
                      >
                        {merchant.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#063f5b]/55">
            {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}
            {selectedCategory ? ` in ${selectedCategory.name}` : ""}
            {selectedMerchant ? ` from ${selectedMerchant.name}` : ""}
            {searchQuery ? ` matching “${searchQuery}”` : ""}
          </p>
          <div className="flex w-full flex-wrap items-center gap-4 sm:w-auto">
            {searchQuery && (
              <Link
                href={{
                  pathname: "/products",
                  query: {
                    ...selectedCategoryQuery,
                    ...selectedMerchantQuery,
                    ...selectedSortQuery,
                  },
                }}
                className="text-sm font-extrabold text-[#009dcc] transition hover:text-[#0784b0]"
              >
                Clear search
              </Link>
            )}
            <nav className="grid min-h-12 w-full grid-cols-[auto_1fr_1fr_1fr] items-center gap-1 rounded-2xl border border-[#063f5b]/10 bg-white p-1 sm:flex sm:w-auto sm:rounded-full" aria-label="Sort products">
              <span className="px-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#063f5b]/40">Sort</span>
              <Link
                href={{
                  pathname: "/products",
                  query: {
                    ...selectedCategoryQuery,
                    ...selectedMerchantQuery,
                    ...selectedSearchQuery,
                    sort: "featured",
                  },
                }}
                aria-current={selectedSort === "featured" ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-center text-xs font-extrabold transition ${selectedSort === "featured" ? "bg-[#009dcc] text-white" : "text-[#063f5b]/60 hover:bg-[#e8f8fc] hover:text-[#009dcc]"}`}
              >
                Featured
              </Link>
              <Link
                href={{
                  pathname: "/products",
                  query: {
                    ...selectedCategoryQuery,
                    ...selectedMerchantQuery,
                    ...selectedSearchQuery,
                  },
                }}
                aria-current={selectedSort === "newest" ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-center text-xs font-extrabold transition ${selectedSort === "newest" ? "bg-[#009dcc] text-white" : "text-[#063f5b]/60 hover:bg-[#e8f8fc] hover:text-[#009dcc]"}`}
              >
                Newest
              </Link>
              <Link
                href={{
                  pathname: "/products",
                  query: {
                    ...selectedCategoryQuery,
                    ...selectedMerchantQuery,
                    ...selectedSearchQuery,
                    sort: "name",
                  },
                }}
                aria-current={selectedSort === "name" ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-center text-xs font-extrabold transition ${selectedSort === "name" ? "bg-[#009dcc] text-white" : "text-[#063f5b]/60 hover:bg-[#e8f8fc] hover:text-[#009dcc]"}`}
              >
                A–Z
              </Link>
            </nav>
          </div>
        </div>

        {visibleProducts.length > 0 ? (
          <ProductResults
            key={`${selectedCategory?.slug ?? "all"}:${selectedMerchant?.id ?? "all"}:${searchQuery}:${selectedSort}`}
            products={visibleProducts}
          />
        ) : (
          <div className="mt-6 rounded-[2rem] border border-[#063f5b]/8 bg-[#f7fcfe] px-6 py-12 text-center sm:px-10">
            <h2 className="text-2xl font-extrabold tracking-[-0.035em] text-[#063f5b]">
              {searchQuery || selectedMerchant ? "No products matched these filters" : "More thoughtful finds are coming"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#063f5b]/60">
              {searchQuery || selectedMerchant
                ? "Try a different category, merchant, or search phrase—or clear the filters to browse everything."
                : "We have not published products in this category yet. Explore the full collection while we carefully add more."}
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-full bg-[#009dcc] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0784b0]"
            >
              {searchQuery || selectedMerchant ? "Clear filters" : "View all products"}
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
