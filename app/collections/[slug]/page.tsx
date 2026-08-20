import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionArtwork } from "@/app/components/collection-card";
import { ProductCard } from "@/app/components/product-card";
import { getCollectionBySlug, getPublishedCollections } from "@/lib/collections";
import { siteConfig } from "@/lib/site";
import { createBreadcrumbStructuredData, createItemListStructuredData, serializeStructuredData } from "@/lib/structured-data";

export async function generateStaticParams() {
  const collections = await getPublishedCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};

  const url = `${siteConfig.url}/collections/${collection.slug}`;
  const image = collection.products[0]?.image;
  return {
    title: collection.name,
    description: collection.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: collection.name,
      description: collection.description,
      images: image ? [{ url: image.src, alt: image.alt }] : undefined,
    },
  };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const pageUrl = `${siteConfig.url}/collections/${collection.slug}`;
  const breadcrumbStructuredData = createBreadcrumbStructuredData(`${pageUrl}#breadcrumb`, [
    { name: "Home", url: siteConfig.url },
    { name: "Collections", url: `${siteConfig.url}/collections` },
    { name: collection.name, url: pageUrl },
  ]);
  const productListStructuredData = createItemListStructuredData({
    id: `${pageUrl}#product-list`,
    name: `${collection.name} products`,
    url: pageUrl,
    items: collection.products.map((product) => ({
      type: "Product",
      name: product.name,
      description: product.summary,
      url: `${siteConfig.url}/products/${product.slug}`,
      image: product.image?.src,
    })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(breadcrumbStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(productListStructuredData) }} />
      <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-12 sm:px-8 md:py-20">
        <div className="absolute -right-20 -top-24 -z-10 size-96 rounded-full bg-[#a8e8f5]/65 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#063f5b]/55">
            <Link href="/" className="hover:text-[#009dcc]">Home</Link><span aria-hidden="true">/</span>
            <Link href="/collections" className="hover:text-[#009dcc]">Collections</Link><span aria-hidden="true">/</span>
            <span className="text-[#063f5b]">{collection.name}</span>
          </nav>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
            <div>
              {collection.badge && <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#009dcc] shadow-sm">{collection.badge}</span>}
              <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">MishBaby collection · {collection.products.length} products</p>
              <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">{collection.name}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#063f5b]/70">{collection.description}</p>
            </div>
            <div className="group overflow-hidden rounded-[2.5rem] border-8 border-white shadow-[0_24px_55px_-38px_rgba(6,63,91,.45)]">
              <CollectionArtwork collection={collection} priority />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7fcfe] px-5 py-14 sm:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Inside this collection</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] text-[#063f5b]">Explore every thoughtful pick.</h2>
            <p className="mt-4 text-base leading-7 text-[#063f5b]/65">Open a product to learn why it may be useful and compare its available merchant offers.</p>
          </div>
          <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {collection.products.map((product) => <ProductCard key={product.id} product={product} variant="compact" />)}
          </div>
        </div>
      </section>
    </>
  );
}
