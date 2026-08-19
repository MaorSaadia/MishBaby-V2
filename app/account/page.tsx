import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";
import { DeleteAccountForm } from "@/app/components/auth/delete-account-form";
import { ProductCard } from "@/app/components/product-card";
import { GuideImage } from "@/app/components/guide-image";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteGuideIds, getFavoriteProductIds } from "@/lib/favorites";
import { getPublishedGuides } from "@/lib/guides";
import { getPublishedProducts } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  if (!isSupabaseConfigured) return <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><h1 className="font-display text-4xl font-semibold">Accounts are being configured</h1><p className="mt-4 text-[#063f5b]/65">Please check back soon.</p></section>;
  const user = await getCurrentUser();
  if (!user?.email) redirect("/sign-in?next=/account");
  const [params, favoriteProductResult, favoriteGuideResult, products, guides] = await Promise.all([
    searchParams,
    getFavoriteProductIds(user.id),
    getFavoriteGuideIds(user.id),
    getPublishedProducts(),
    getPublishedGuides(),
  ]);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const favoriteProducts = favoriteProductResult.productIds.flatMap((id) => {
    const product = productsById.get(id);
    return product ? [product] : [];
  });
  const guidesById = new Map(guides.map((guide) => [guide.id, guide]));
  const favoriteGuides = favoriteGuideResult.guideIds.flatMap((id) => {
    const guide = guidesById.get(id);
    return guide ? [guide] : [];
  });

  return <section className="bg-[#f7fcfe] px-5 py-14 sm:px-8 sm:py-20"><div className="mx-auto max-w-6xl">
    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#009dcc]">Your MishBaby account</p>
    <h1 className="mt-2 font-display text-5xl font-semibold tracking-[-0.05em]">Account</h1>
    {params.password === "updated" && <p role="status" className="mt-6 rounded-xl bg-[#e7f8ee] px-4 py-3 text-sm text-[#195b37]">Your password was updated.</p>}
    <div className="mt-8 rounded-[2rem] border border-[#063f5b]/10 bg-white p-6 sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Saved products</p>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">Your favorites</h2>
      {favoriteProductResult.error ? <p role="status" className="mt-5 rounded-xl bg-[#fff0f1] px-4 py-3 text-sm text-[#8a2430]">Saved products are temporarily unavailable. Please try again later.</p> : favoriteProducts.length > 0 ? <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">{favoriteProducts.map((product) => <ProductCard key={product.id} product={product} variant="compact" />)}</div> : <div className="mt-5 rounded-2xl bg-[#f1fbfe] p-5"><p className="font-bold">Nothing saved yet</p><p className="mt-1 text-sm leading-6 text-[#063f5b]/60">Use the heart button on a product page to keep useful finds here.</p></div>}
    </div>
    <div className="mt-6 rounded-[2rem] border border-[#063f5b]/10 bg-white p-6 sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Saved guides</p>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">Your reading list</h2>
      {favoriteGuideResult.error ? <p role="status" className="mt-5 rounded-xl bg-[#fff0f1] px-4 py-3 text-sm text-[#8a2430]">Saved guides are temporarily unavailable. Please try again later.</p> : favoriteGuides.length > 0 ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{favoriteGuides.map((guide) => <article key={guide.id} className="group overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-[#fbfeff] shadow-[0_16px_36px_-28px_rgba(6,63,91,.4)]"><Link href={`/guides/${guide.slug}`} className="block h-full"><GuideImage guide={guide} variant="related" /><div className="p-6"><div className="flex flex-wrap items-center gap-3 text-xs font-bold"><span className="uppercase tracking-[0.12em] text-[#009dcc]">{guide.categoryLabel}</span>{guide.readingMinutes && <span className="text-[#063f5b]/45">{guide.readingMinutes} min read</span>}</div><h3 className="mt-3 text-xl font-extrabold leading-snug tracking-[-0.03em]">{guide.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#063f5b]/65">{guide.description}</p><span className="mt-5 inline-flex text-xs font-extrabold text-[#009dcc]">Read the guide <span aria-hidden="true">&rarr;</span></span></div></Link></article>)}</div> : <div className="mt-5 rounded-2xl bg-[#f1fbfe] p-5"><p className="font-bold">Your reading list is empty</p><p className="mt-1 text-sm leading-6 text-[#063f5b]/60">Use the bookmark button on a guide to save it here.</p></div>}
    </div>
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <div className="rounded-[2rem] border border-[#063f5b]/10 bg-white p-6 sm:p-8"><h2 className="text-xl font-extrabold">Sign-in email</h2><p className="mt-2 break-all text-[#063f5b]/65">{user.email}</p><form action={signOutAction} className="mt-6"><button className="rounded-full border border-[#063f5b]/15 px-5 py-3 text-sm font-extrabold transition hover:bg-[#e8f8fc]">Sign out</button></form></div>
      <div className="rounded-[2rem] border border-[#9f2734]/20 bg-white p-6 sm:p-8"><h2 className="text-xl font-extrabold text-[#8a2430]">Delete account</h2><p className="mt-2 text-sm leading-6 text-[#063f5b]/65">This permanently deletes your MishBaby account, saved products, and saved guides and cannot be undone.</p><DeleteAccountForm email={user.email} /></div>
    </div>
  </div></section>;
}
