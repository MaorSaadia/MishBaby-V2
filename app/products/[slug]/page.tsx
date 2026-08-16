import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OfferComparison } from "../../components/offer-comparison";
import { ProductImage } from "../../components/product-image";
import { getCategory } from "../../categories/category-data";
import { getOffersForProduct, getProductBySlug, products } from "@/lib/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) return {};

  return {
    title: product.name,
    description: product.summary,
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const category = getCategory(product.categorySlug);
  const productOffers = getOffersForProduct(product.id);

  if (!category) notFound();

  return (
    <>
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
          <OfferComparison offers={productOffers} />
        </section>
    </>
  );
}
