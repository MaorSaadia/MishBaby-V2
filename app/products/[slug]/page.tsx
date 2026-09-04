import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AmazonSimilarProducts } from "../../components/amazon-similar-products";
import { AliExpressSimilarProducts } from "../../components/aliexpress-similar-products";
import { GuideCard } from "../../components/guide-card";
import { OfferComparison } from "../../components/offer-comparison";
import { HeroMerchantLinks, MobileMerchantTray } from "../../components/merchant-quick-actions";
import { ProductImage } from "../../components/product-image";
import { ProductOffersProvider } from "../../components/product-offers-context";
import { RecentlyViewedProducts } from "../../components/recently-viewed-products";
import { ShareControls } from "../../components/share-controls";
import { FavoriteProductButton } from "../../components/favorite-product-button";
import { getCategoryBySlug } from "@/lib/categories";
import { getPublishedGuidesByProductId } from "@/lib/guides";
import { getProductBySlug, getPublishedProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return {};

  const productUrl = `${siteConfig.url}/products/${product.slug}`;
  const socialImageUrl = `${productUrl}/opengraph-image`;
  const socialImages = [{
    url: socialImageUrl,
    width: 1200,
    height: 630,
    alt: `${product.name} — a MishBaby product find`,
  }];

  return {
    title: product.name,
    description: product.summary,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      url: productUrl,
      siteName: siteConfig.name,
      title: product.name,
      description: product.summary,
      images: socialImages,
    },
    twitter: {
      card: product.image ? "summary_large_image" : "summary",
      title: product.name,
      description: product.summary,
      images: socialImages,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [category, relatedGuides] = await Promise.all([
    getCategoryBySlug(product.categorySlug),
    getPublishedGuidesByProductId(product.id),
  ]);
  if (!category) notFound();

  const productUrl = `${siteConfig.url}/products/${product.slug}`;
  const categoryUrl = `${siteConfig.url}/categories/${category.slug}`;
  const currentAmazonAsin = product.offers.find((offer) => offer.merchant.id === "amazon")?.amazonAsin;
  const currentAliExpressOfferUrl = product.offers.find((offer) => offer.merchant.id === "aliexpress")?.url;
  const bestFor = product.bestFor?.trim();
  const keyFacts = product.keyFacts.filter((fact) => fact.label.trim() && fact.value.trim());
  const considerations = product.considerations.filter((consideration) => consideration.trim());
  const hasBuyingDetails = Boolean(bestFor || keyFacts.length > 0 || considerations.length > 0);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: product.name,
        description: product.summary,
        ...(product.image ? { image: [product.image.src] } : {}),
        category: category.name,
        url: productUrl,
        mainEntityOfPage: productUrl,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${productUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteConfig.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Categories",
            item: `${siteConfig.url}/categories`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: categoryUrl,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: product.name,
            item: productUrl,
          },
        ],
      },
    ],
  };

  return (
    <ProductOffersProvider key={product.id} offers={product.offers}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <section className="bg-[#f1fbfe] px-5 py-10 sm:px-8 md:py-16">
          <div className="mx-auto max-w-6xl">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#063f5b]/55">
              <Link href="/" className="hover:text-[#009dcc]">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/categories" className="hover:text-[#009dcc]">Categories</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/categories/${category.slug}`} className="hover:text-[#009dcc]">{category.name}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-[#063f5b]">{product.name}</span>
            </nav>

            <div className="mt-9 grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
              <div className="relative grid aspect-square max-w-xl place-items-center overflow-hidden rounded-[2.5rem] bg-[#dff4f8] shadow-[0_24px_55px_-38px_rgba(6,63,91,.45)]">
                <div className="absolute -right-16 -top-16 size-64 rounded-full bg-[#a8e8f5]/80" />
                <div className="absolute -bottom-20 -left-14 size-56 rounded-full bg-white/70" />
                <ProductImage product={product} variant="detail" preload />
              </div>

              <div>
                {product.badge && <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#009dcc] shadow-sm">{product.badge}</span>}
                <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">{category.name}</p>
                <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">{product.name}</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#063f5b]/70">{product.summary}</p>
                <HeroMerchantLinks />
                <FavoriteProductButton productId={product.id} productSlug={product.slug} />
                <ShareControls
                  url={productUrl}
                  title={product.name}
                  text={product.summary}
                  label={`Share ${product.name}`}
                  imageUrl={product.image?.src}
                />
                <div className="mt-8 rounded-3xl border border-[#063f5b]/8 bg-white/75 p-6">
                  <h2 className="font-extrabold text-[#063f5b]">Why it may be useful</h2>
                  <ul className="mt-4 grid gap-3">
                    {product.highlights.map((highlight) => <li key={highlight} className="flex gap-3 text-sm leading-6 text-[#063f5b]/65"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#009dcc]" />{highlight}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {hasBuyingDetails && (
          <section className="bg-[#fbfeff] px-5 py-12 sm:px-8 sm:py-16 md:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-2xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Buying details</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.045em] text-[#063f5b] sm:text-4xl">A clearer look before you choose.</h2>
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:items-start">
                <div className="grid gap-5">
                  {bestFor && (
                    <div className="rounded-3xl border border-[#009dcc]/15 bg-[#e8f8fc] p-5 sm:p-7">
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Best for</p>
                      <p className="mt-3 text-lg font-bold leading-7 text-[#063f5b]">{bestFor}</p>
                    </div>
                  )}

                  {keyFacts.length > 0 && (
                    <div className="rounded-3xl border border-[#063f5b]/8 bg-white p-5 sm:p-7">
                      <h3 className="text-xl font-extrabold text-[#063f5b]">At a glance</h3>
                      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                        {keyFacts.map((fact) => (
                          <div key={`${fact.label}:${fact.value}`} className="rounded-2xl bg-[#f7fcfe] p-4">
                            <dt className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#009dcc]">{fact.label}</dt>
                            <dd className="mt-2 text-sm font-bold leading-6 text-[#063f5b]">{fact.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>

                {considerations.length > 0 && (
                  <div className="rounded-3xl border border-[#063f5b]/8 bg-white p-5 sm:p-7">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Before you choose</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.035em] text-[#063f5b]">A few things worth checking.</h3>
                    <ul className="mt-5 grid gap-4">
                      {considerations.map((consideration) => (
                        <li key={consideration} className="flex gap-3 text-sm leading-6 text-[#063f5b]/70">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#e8f8fc] text-[11px] font-black text-[#009dcc]" aria-hidden="true">✓</span>
                          <span>{consideration}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20">
          <div className="mb-8 text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Shop your way</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">One product, multiple offers.</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#063f5b]/65">This is the foundation for comparing merchant options while keeping the product itself independent.</p>
          </div>
          <OfferComparison />
        </section>

        <AmazonSimilarProducts
          productName={product.name}
          categoryName={category.name}
          currentAsin={currentAmazonAsin}
        />

        <AliExpressSimilarProducts
          productName={product.name}
          currentOfferUrl={currentAliExpressOfferUrl}
        />

        {relatedGuides.length > 0 && (
          <section className="bg-[#f7fcfe] px-5 py-14 sm:px-8 md:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-2xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Helpful guides</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">Learn more before you choose.</h2>
                <p className="mt-4 text-base leading-7 text-[#063f5b]/65">Practical, parent-friendly guidance related to this product.</p>
              </div>

              <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedGuides.map((guide) => <GuideCard key={guide.id} guide={guide} variant="related" />)}
              </div>
            </div>
          </section>
        )}

        <RecentlyViewedProducts
          product={{
            slug: product.slug,
            name: product.name,
            summary: product.summary,
            image: product.image,
          }}
        />
        <MobileMerchantTray />
    </ProductOffersProvider>
  );
}
