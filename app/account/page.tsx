import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DeleteAccountForm } from "@/app/components/auth/delete-account-form";
import { SignOutButton } from "@/app/components/auth/sign-out-button";
import { MarketingPreferencesForm } from "@/app/components/auth/marketing-preferences-form";
import { ProductCard } from "@/app/components/product-card";
import { GuideCard } from "@/app/components/guide-card";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteGuideIds, getFavoriteProductIds } from "@/lib/favorites";
import { getPublishedGuides } from "@/lib/guides";
import { getPublishedProducts } from "@/lib/products";
import { getMarketingPreference } from "@/lib/marketing-consent";
import { getMarketingContactSync, isResendMarketingSyncEnabled } from "@/lib/resend-marketing";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  if (!isSupabaseConfigured) return <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><h1 className="font-display text-4xl font-semibold">Accounts are being configured</h1><p className="mt-4 text-[#063f5b]/65">Please check back soon.</p></section>;
  const user = await getCurrentUser();
  if (!user?.email) redirect("/sign-in?next=/account");
  const marketingSyncEnabled = isResendMarketingSyncEnabled();
  const [params, favoriteProductResult, favoriteGuideResult, marketingPreference, marketingContactSync, products, guides] = await Promise.all([
    searchParams,
    getFavoriteProductIds(user.id),
    getFavoriteGuideIds(user.id),
    getMarketingPreference(user.id),
    marketingSyncEnabled ? getMarketingContactSync(user.id) : Promise.resolve({ status: undefined }),
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
      {favoriteGuideResult.error ? <p role="status" className="mt-5 rounded-xl bg-[#fff0f1] px-4 py-3 text-sm text-[#8a2430]">Saved guides are temporarily unavailable. Please try again later.</p> : favoriteGuides.length > 0 ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{favoriteGuides.map((guide) => <GuideCard key={guide.id} guide={guide} variant="related" />)}</div> : <div className="mt-5 rounded-2xl bg-[#f1fbfe] p-5"><p className="font-bold">Your reading list is empty</p><p className="mt-1 text-sm leading-6 text-[#063f5b]/60">Use the bookmark button on a guide to save it here.</p></div>}
    </div>
    <div className="mt-6 rounded-[2rem] border border-[#063f5b]/10 bg-white p-6 sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Email preferences</p>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em]">Optional MishBaby updates</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#063f5b]/65">Account and security emails remain transactional. Marketing updates are optional and require your clear consent.</p>
      {marketingPreference.error ? <p role="status" className="mt-5 rounded-xl bg-[#fff0f1] px-4 py-3 text-sm text-[#8a2430]">Email preferences are temporarily unavailable. Please try again later.</p> : <MarketingPreferencesForm subscribed={marketingPreference.status === "subscribed"} occurredAt={marketingPreference.occurredAt} syncEnabled={marketingSyncEnabled} syncStatus={marketingContactSync.status} />}
    </div>
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <div className="rounded-[2rem] border border-[#063f5b]/10 bg-white p-6 sm:p-8"><h2 className="text-xl font-extrabold">Sign-in email</h2><p className="mt-2 break-all text-[#063f5b]/65">{user.email}</p><SignOutButton /></div>
      <div className="rounded-[2rem] border border-[#9f2734]/20 bg-white p-6 sm:p-8"><h2 className="text-xl font-extrabold text-[#8a2430]">Delete account</h2><p className="mt-2 text-sm leading-6 text-[#063f5b]/65">This permanently deletes your MishBaby account, saved products, and saved guides and cannot be undone.</p><DeleteAccountForm email={user.email} /></div>
    </div>
  </div></section>;
}
