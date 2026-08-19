import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideImage } from "../../components/guide-image";
import { OfferComparison } from "../../components/offer-comparison";
import { ProductCard } from "../../components/product-card";
import { ProductImage } from "../../components/product-image";
import { RecentlyViewedProducts } from "../../components/recently-viewed-products";
import { getCategoryBySlug } from "@/lib/categories";
import { getPublishedGuidesByProductId } from "@/lib/guides";
import { getProductBySlug, getPublishedProducts, getRelatedProducts } from "@/lib/products";
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
  const socialImages = product.image
    ? [{ url: product.image.src, alt: product.image.alt }]
    : undefined;

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

  const [category, relatedGuides, relatedProducts] = await Promise.all([
    getCategoryBySlug(product.categorySlug),
    getPublishedGuidesByProductId(product.id),
    getRelatedProducts(product),
  ]);
  if (!category) notFound();

  const productUrl = `${siteConfig.url}/products/${product.slug}`;
  const categoryUrl = `${siteConfig.url}/categories/${category.slug}`;
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
    <>
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

            <div className="mt-9 grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <div className="relative grid aspect-square max-w-xl place-items-center overflow-hidden rounded-[2.5rem] bg-[#dff4f8] shadow-[0_24px_55px_-38px_rgba(6,63,91,.45)]">
                <div className="absolute -right-16 -top-16 size-64 rounded-full bg-[#a8e8f5]/80" />
                <div className="absolute -bottom-20 -left-14 size-56 rounded-full bg-white/70" />
                <ProductImage product={product} variant="detail" priority />
              </div>

              <div>
                {product.badge && <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#009dcc] shadow-sm">{product.badge}</span>}
                <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">{category.name}</p>
                <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">{product.name}</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#063f5b]/70">{product.summary}</p>
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

        <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 md:py-20">
          <div className="mb-8 text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Shop your way</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">One product, multiple offers.</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#063f5b]/65">This is the foundation for comparing merchant options while keeping the product itself independent.</p>
          </div>
          <OfferComparison offers={product.offers} />
        </section>

        {relatedProducts.length > 0 && (
          <section className="border-y border-[#063f5b]/6 bg-[#f1fbfe] px-5 py-14 sm:px-8 md:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">More to explore</p>
                  <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">More from {category.name}.</h2>
                  <p className="mt-4 text-base leading-7 text-[#063f5b]/65">Discover other useful products selected for the same stage or routine.</p>
                </div>
                <Link href={`/categories/${category.slug}`} className="shrink-0 text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">View all in {category.name} →</Link>
              </div>

              <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} variant="compact" />
                ))}
              </div>
            </div>
          </section>
        )}

        {relatedGuides.length > 0 && (
          <section className="bg-[#f7fcfe] px-5 py-14 sm:px-8 md:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-2xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Helpful guides</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">Learn more before you choose.</h2>
                <p className="mt-4 text-base leading-7 text-[#063f5b]/65">Practical, parent-friendly guidance related to this product.</p>
              </div>

              <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedGuides.map((guide) => (
                  <article key={guide.id} className="overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-white shadow-[0_16px_36px_-28px_rgba(6,63,91,.4)]">
                    <GuideImage guide={guide} variant="related" />
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                        <span className="uppercase tracking-[0.12em] text-[#009dcc]">{guide.categoryLabel}</span>
                        {guide.readingMinutes && <span className="text-[#063f5b]/45">{guide.readingMinutes} min read</span>}
                      </div>
                      <h3 className="mt-3 text-xl font-extrabold leading-snug tracking-[-0.03em] text-[#063f5b]">{guide.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-[#063f5b]/65">{guide.description}</p>
                      <Link href={`/guides/${guide.slug}`} className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">Read the guide <span aria-hidden="true">→</span></Link>
                    </div>
                  </article>
                ))}
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
    </>
  );
}
