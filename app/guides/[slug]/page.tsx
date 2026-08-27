import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AmazonGuideProducts } from "@/app/components/amazon-similar-products";
import { AliExpressGuideProducts } from "@/app/components/aliexpress-similar-products";
import { GuideImage } from "@/app/components/guide-image";
import { ProductCard } from "@/app/components/product-card";
import { RecentlyViewedGuides } from "@/app/components/recently-viewed-guides";
import { ShareControls } from "@/app/components/share-controls";
import { FavoriteGuideButton } from "@/app/components/favorite-guide-button";
import { GuideCard } from "@/app/components/guide-card";
import { getPublishedGuideBySlug, getPublishedGuides, getRelatedGuides } from "@/lib/guides";
import { siteConfig } from "@/lib/site";

function createSectionId(heading: string, index: number) {
  const headingSlug = heading
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);

  return `guide-section-${index + 1}-${headingSlug || "topic"}`;
}

export async function generateStaticParams() {
  const publishedGuides = await getPublishedGuides();
  return publishedGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getPublishedGuideBySlug(slug);

  if (!guide) return {};

  const guideUrl = `${siteConfig.url}/guides/${guide.slug}`;
  const socialImages = guide.coverImage
    ? [{ url: guide.coverImage.src, alt: guide.coverImage.alt }]
    : undefined;

  return {
    title: guide.title,
    description: guide.description,
    alternates: {
      canonical: guideUrl,
    },
    openGraph: {
      type: "article",
      url: guideUrl,
      siteName: siteConfig.name,
      title: guide.title,
      description: guide.description,
      images: socialImages,
    },
    twitter: {
      card: guide.coverImage ? "summary_large_image" : "summary",
      title: guide.title,
      description: guide.description,
      images: socialImages,
    },
  };
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = await getPublishedGuideBySlug(slug);

  if (!guide?.introduction || !guide.readingMinutes || !guide.relatedCategory || guide.sections.length === 0) notFound();

  const relatedGuides = await getRelatedGuides(guide);
  const guideUrl = `${siteConfig.url}/guides/${guide.slug}`;
  const curatedAmazonAsins = guide.relatedProducts.flatMap((product) =>
    product.offers.flatMap((offer) => offer.amazonAsin ? [offer.amazonAsin] : []),
  );
  const curatedAliExpressOfferUrls = guide.relatedProducts.flatMap((product) =>
    product.offers.flatMap((offer) => offer.merchant.id === "aliexpress" && offer.url ? [offer.url] : []),
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${guideUrl}#article`,
        headline: guide.title,
        description: guide.description,
        ...(guide.coverImage ? { image: [guide.coverImage.src] } : {}),
        articleSection: guide.categoryLabel,
        dateCreated: guide.createdAt,
        dateModified: guide.updatedAt,
        timeRequired: `PT${guide.readingMinutes}M`,
        inLanguage: "en-US",
        mainEntityOfPage: guideUrl,
        author: {
          "@type": "Organization",
          name: siteConfig.name,
          url: `${siteConfig.url}/about`,
        },
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${guideUrl}#breadcrumb`,
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
            name: "Guides",
            item: `${siteConfig.url}/guides`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.title,
            item: guideUrl,
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
        <header className="relative isolate overflow-hidden bg-[#f1fbfe] px-5 py-10 sm:px-8 sm:py-14 md:py-20">
          <div className="absolute -right-20 -top-20 -z-10 size-96 rounded-full bg-[#a8e8f5]/70 blur-3xl" />
          <div className="mx-auto max-w-4xl">
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 overflow-hidden text-xs font-bold text-[#063f5b]/55 sm:text-sm">
              <Link href="/" className="shrink-0 hover:text-[#009dcc]">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/guides" className="shrink-0 hover:text-[#009dcc]">Guides</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="min-w-0 truncate text-[#063f5b]">{guide.title}</span>
            </nav>
            <div className="mt-7 flex flex-wrap items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.12em] sm:mt-10 sm:text-xs">
              <span className="rounded-full bg-white px-3 py-1.5 text-[#009dcc] shadow-sm">{guide.categoryLabel}</span>
              <span className="text-[#063f5b]/45">{guide.readingMinutes} min read</span>
            </div>
            <h1 className="mt-4 break-words font-display text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#063f5b] sm:mt-5 sm:text-6xl sm:leading-[1.05]">{guide.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-7 text-[#063f5b]/70 sm:mt-6 sm:text-xl sm:leading-8">{guide.description}</p>
            <FavoriteGuideButton guideId={guide.id} guideSlug={guide.slug} />
            <ShareControls
              url={guideUrl}
              title={guide.title}
              text={guide.description}
              label={`Share ${guide.title}`}
            />
            <GuideImage guide={guide} variant="detail" preload />
          </div>
        </header>

        <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 md:py-20">
          <p className="font-display text-[1.35rem] leading-8 text-[#063f5b] sm:text-2xl sm:leading-10">{guide.introduction}</p>

          <aside className="mt-8 rounded-2xl border border-[#009dcc]/15 bg-[#e8f8fc] p-5 text-sm leading-6 text-[#063f5b]/70 sm:mt-10 sm:rounded-3xl sm:p-6">
            Every baby, family, and home is different. Use this guide as a starting point, follow the product instructions and current safety guidance, and ask a qualified professional when you need advice for your baby’s specific needs.
          </aside>

          <nav id="guide-contents" aria-labelledby="guide-contents-heading" className="mt-8 scroll-mt-6 rounded-3xl border border-[#063f5b]/8 bg-[#f7fcfe] p-5 sm:mt-10 sm:rounded-[2rem] sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">In this guide</p>
            <h2 id="guide-contents-heading" className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-[#063f5b] sm:text-3xl">Jump to a section.</h2>
            <ol className="mt-5 grid gap-2 sm:mt-6 sm:grid-cols-2">
              {guide.sections.map((section, index) => (
                <li key={section.key || section.heading}>
                  <a href={`#${createSectionId(section.heading, index)}`} className="group flex min-h-12 items-start gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-extrabold leading-5 text-[#063f5b]/75 transition hover:text-[#009dcc]">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e2f7fc] text-[11px] text-[#009dcc] transition group-hover:bg-[#009dcc] group-hover:text-white">{index + 1}</span>
                    <span>{section.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-12 grid gap-11 sm:mt-14 sm:gap-14">
            {guide.sections.map((section, index) => (
              <section id={createSectionId(section.heading, index)} key={section.key || section.heading} className="scroll-mt-6 sm:scroll-mt-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e2f7fc] text-xs font-extrabold text-[#009dcc] sm:size-9 sm:text-sm">{index + 1}</span>
                  <h2 className="break-words font-display text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#063f5b] sm:text-3xl">{section.heading}</h2>
                </div>
                <div className="mt-4 grid gap-4 text-[15px] leading-7 text-[#063f5b]/70 sm:mt-5 sm:gap-5 sm:text-base sm:leading-8">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                {section.items && (
                  <ul className="mt-5 grid gap-3 rounded-2xl bg-[#f7fcfe] p-4 sm:mt-6 sm:rounded-3xl sm:p-6">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-[#063f5b]/70">
                        <span className="mt-1.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#009dcc] text-white" aria-hidden="true">
                          <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m2.25 6.25 2.25 2.25 5.25-5.25" />
                          </svg>
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <a href="#guide-contents" className="mt-5 inline-flex min-h-11 items-center gap-2 text-xs font-extrabold text-[#063f5b]/45 transition hover:text-[#009dcc] sm:mt-6">
                  Back to contents <span aria-hidden="true">↑</span>
                </a>
              </section>
            ))}
          </div>

          <section className="mt-14 rounded-3xl bg-[#063f5b] px-6 py-8 text-white sm:mt-16 sm:rounded-[2rem] sm:px-9 sm:py-9">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a8e8f5]">Ready to explore?</p>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-3xl">Find thoughtful products for your family’s routine.</h2>
            <Link href={`/categories/${guide.relatedCategory.slug}`} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#063f5b] transition hover:bg-[#e8f8fc]">Explore {guide.relatedCategory.label}</Link>
          </section>
        </article>

        <AmazonGuideProducts
          guideTitle={guide.title}
          categoryName={guide.relatedCategory.label}
          excludedAsins={curatedAmazonAsins}
        />

        <AliExpressGuideProducts
          guideTitle={guide.title}
          categoryName={guide.relatedCategory.label}
          excludedOfferUrls={curatedAliExpressOfferUrls}
        />

        {guide.relatedProducts.length > 0 && (
          <section className="border-y border-[#063f5b]/6 bg-white px-5 py-12 sm:px-8 sm:py-16 md:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Related products</p>
                  <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#063f5b] sm:text-4xl">Thoughtful finds for this guide.</h2>
                  <p className="mt-4 text-base leading-7 text-[#063f5b]/65">Explore selected products and compare the active merchant offers currently available.</p>
                </div>
                <Link href={`/categories/${guide.relatedCategory.slug}`} className="shrink-0 text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">View all in {guide.relatedCategory.label} <span aria-hidden="true">→</span></Link>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-9 sm:gap-5 lg:grid-cols-4">
                {guide.relatedProducts.map((product) => <ProductCard key={product.id} product={product} variant="compact" />)}
              </div>
            </div>
          </section>
        )}

        {relatedGuides.length > 0 && (
          <section className="border-t border-[#063f5b]/6 bg-white px-5 py-12 sm:px-8 sm:py-16 md:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Keep learning</p>
                  <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#063f5b] sm:text-4xl">More guides for {guide.relatedCategory.label}.</h2>
                  <p className="mt-4 text-base leading-7 text-[#063f5b]/65">Continue with practical, parent-friendly guidance related to the same stage or routine.</p>
                </div>
                <Link href="/guides" className="shrink-0 text-sm font-extrabold text-[#009dcc] transition-colors hover:text-[#0784b0]">Browse all guides →</Link>
              </div>

              <div className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {relatedGuides.map((relatedGuide) => <GuideCard key={relatedGuide.id} guide={relatedGuide} variant="related" />)}
              </div>
            </div>
          </section>
        )}

        <RecentlyViewedGuides
          guide={{
            slug: guide.slug,
            title: guide.title,
            description: guide.description,
            categoryLabel: guide.categoryLabel,
            readingMinutes: guide.readingMinutes,
            symbol: guide.symbol,
            colorTheme: guide.colorTheme,
            coverImage: guide.coverImage,
          }}
        />
    </>
  );
}
