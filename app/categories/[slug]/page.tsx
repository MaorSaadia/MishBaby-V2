import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideCard } from "../../components/guide-card";
import { ProductCard } from "../../components/product-card";
import { AmazonCategoryProducts } from "@/app/components/amazon-similar-products";
import { AliExpressCategoryProducts } from "@/app/components/aliexpress-similar-products";
import { getCategoryBySlug, getPublishedCategories } from "@/lib/categories";
import { getCategoryThemeClass } from "@/lib/category-themes";
import { getPublishedGuidesByCategorySlug } from "@/lib/guides";
import { getProductsByCategory } from "@/lib/products";
import { siteConfig } from "@/lib/site";
import { createBreadcrumbStructuredData, createItemListStructuredData, serializeStructuredData } from "@/lib/structured-data";

export async function generateStaticParams() {
  const categories = await getPublishedCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return {};

  const categoryUrl = `${siteConfig.url}/categories/${category.slug}`;

  return {
    title: category.name,
    description: category.introduction,
    alternates: {
      canonical: categoryUrl,
    },
  };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const [featuredProducts, relatedGuides] = await Promise.all([
    getProductsByCategory(category.slug),
    getPublishedGuidesByCategorySlug(category.slug),
  ]);
  const curatedAmazonAsins = featuredProducts.flatMap((product) =>
    product.offers.flatMap((offer) => offer.amazonAsin ? [offer.amazonAsin] : []),
  );
  const curatedAliExpressOfferUrls = featuredProducts.flatMap((product) =>
    product.offers.flatMap((offer) => offer.merchant.id === "aliexpress" && offer.url ? [offer.url] : []),
  );
  const categoryUrl = `${siteConfig.url}/categories/${category.slug}`;
  const breadcrumbStructuredData = createBreadcrumbStructuredData(
    `${categoryUrl}#breadcrumb`,
    [
      { name: "Home", url: siteConfig.url },
      { name: "Categories", url: `${siteConfig.url}/categories` },
      { name: category.name, url: categoryUrl },
    ],
  );
  const productListStructuredData = featuredProducts.length > 0
    ? createItemListStructuredData({
        id: `${categoryUrl}#product-list`,
        name: `${category.name} products`,
        url: categoryUrl,
        items: featuredProducts.map((product) => ({
          type: "Product",
          name: product.name,
          description: product.summary,
          url: `${siteConfig.url}/products/${product.slug}`,
          image: product.image?.src,
        })),
      })
    : undefined;
  const guideListStructuredData = relatedGuides.length > 0
    ? createItemListStructuredData({
        id: `${categoryUrl}#guide-list`,
        name: `${category.name} guides`,
        url: categoryUrl,
        items: relatedGuides.map((guide) => ({
          type: "Article",
          name: guide.title,
          description: guide.description,
          url: `${siteConfig.url}/guides/${guide.slug}`,
          image: guide.coverImage?.src,
        })),
      })
    : undefined;

  return (
    <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeStructuredData(breadcrumbStructuredData) }}
        />
        {productListStructuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeStructuredData(productListStructuredData) }}
          />
        )}
        {guideListStructuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeStructuredData(guideListStructuredData) }}
          />
        )}
        <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-10 sm:px-8 sm:py-14 md:py-20">
          <div className={`absolute -right-20 -top-24 -z-10 size-96 rounded-full ${getCategoryThemeClass(category.colorTheme)} blur-2xl`} />
          <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 overflow-hidden text-xs font-bold text-[#063f5b]/55 sm:text-sm">
              <Link href="/" className="shrink-0 hover:text-[#009dcc]">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/categories" className="shrink-0 hover:text-[#009dcc]">Categories</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="min-w-0 truncate text-[#063f5b]">{category.name}</span>
            </nav>
            <div className="mt-7 grid gap-7 sm:mt-10 sm:gap-10 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc] sm:text-sm">MishBaby category</p>
                <h1 className="mt-3 max-w-3xl break-words font-display text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#063f5b] sm:text-6xl sm:leading-[1.05]">{category.name}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#063f5b]/70 sm:mt-5 sm:text-lg sm:leading-8">{category.introduction}</p>
                {category.topics.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2" aria-label={`${category.name} topics`}>
                    {category.topics.map((topic) => (
                      <span key={topic} className="rounded-full border border-[#063f5b]/8 bg-white px-3 py-1.5 text-xs font-bold text-[#063f5b]/70 shadow-sm">{topic}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className={`grid size-24 place-items-center rounded-3xl ${getCategoryThemeClass(category.colorTheme)} text-4xl text-[#009dcc] shadow-[0_20px_45px_-30px_rgba(6,63,91,.4)] sm:size-32 sm:text-5xl md:size-48 md:rounded-[2.5rem] md:text-6xl`} aria-hidden="true">{category.symbol}</div>
            </div>
          </div>
        </section>

        {featuredProducts.length > 0 && (
          <section className="bg-[#f7fcfe] px-5 py-12 sm:px-8 sm:py-16 md:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-2xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Featured picks</p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#063f5b] sm:text-4xl">Thoughtful finds for this stage.</h2>
                <p className="mt-4 text-base leading-7 text-[#063f5b]/65">Explore useful products and compare the merchant options currently available.</p>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-9 sm:gap-5 lg:grid-cols-3">
                {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </div>
          </section>
        )}

        <AmazonCategoryProducts
          categoryName={category.name}
          topics={category.topics}
          excludedAsins={curatedAmazonAsins}
        />

        <AliExpressCategoryProducts
          categoryName={category.name}
          topics={category.topics}
          excludedOfferUrls={curatedAliExpressOfferUrls}
        />

        {relatedGuides.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 md:py-20">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Helpful guides</p>
                <h2 className="mt-3 break-words font-display text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#063f5b] sm:text-4xl">Practical help for {category.name.toLowerCase()}.</h2>
                <p className="mt-4 text-base leading-7 text-[#063f5b]/65">Explore clear, parent-friendly guidance related to this category.</p>
              </div>
              <Link href="/guides" className="shrink-0 text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">View all guides →</Link>
            </div>

            <div className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {relatedGuides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-16 md:pb-22">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#063f5b] px-6 py-8 text-white sm:rounded-[2rem] sm:px-10 sm:py-10 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a8e8f5]">Explore more</p>
              <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-3xl">Browse every little stage in one place.</h2>
            </div>
            <Link href="/categories" className="inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#063f5b] transition hover:bg-[#e8f8fc] sm:w-auto">View all categories</Link>
          </div>
        </section>
    </>
  );
}
