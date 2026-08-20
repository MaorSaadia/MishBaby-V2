import type { Metadata } from "next";
import { CollectionCard } from "@/app/components/collection-card";
import { getPublishedCollections } from "@/lib/collections";
import { siteConfig } from "@/lib/site";
import { createBreadcrumbStructuredData, createItemListStructuredData, serializeStructuredData } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Baby Product Collections",
  description: "Explore thoughtfully curated MishBaby product collections for everyday routines, stages, and parenting needs.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const collections = await getPublishedCollections();
  const pageUrl = `${siteConfig.url}/collections`;
  const breadcrumbStructuredData = createBreadcrumbStructuredData(`${pageUrl}#breadcrumb`, [
    { name: "Home", url: siteConfig.url },
    { name: "Collections", url: pageUrl },
  ]);
  const collectionListStructuredData = collections.length > 0
    ? createItemListStructuredData({
        id: `${pageUrl}#collection-list`,
        name: "MishBaby curated product collections",
        url: pageUrl,
        items: collections.map((collection) => ({
          type: "CollectionPage",
          name: collection.name,
          description: collection.description,
          url: `${pageUrl}/${collection.slug}`,
          image: collection.products[0]?.image?.src,
        })),
      })
    : undefined;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(breadcrumbStructuredData) }} />
      {collectionListStructuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(collectionListStructuredData) }} />}
      <section className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-16 sm:px-8 md:py-22">
        <div className="absolute -right-16 -top-16 -z-10 size-80 rounded-full bg-[#a8e8f5]/65 blur-3xl" />
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Curated for real life</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#063f5b] sm:text-6xl">Thoughtful finds, gathered together.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#063f5b]/70">Explore practical product collections created around the stages, routines, and little moments that matter to growing families.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
        {collections.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => <CollectionCard key={collection.id} collection={collection} />)}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-[#063f5b]/8 bg-[#f1fbfe] p-8 text-center sm:p-12">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-[#063f5b]">Our first collections are being prepared.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#063f5b]/65">We’re gathering useful products into clearer, easier places to start. Please check back soon.</p>
          </div>
        )}
      </section>
    </>
  );
}
