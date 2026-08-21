import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductImage } from "./product-image";
import { CardFavoriteButton } from "./card-favorite-button";

type ProductCardProps = {
  product: Product;
  variant?: "default" | "compact";
};

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const hasLiveOffers = product.offers.length > 0;
  const merchantNames = product.offers.map((offer) => offer.merchant.name);
  const compact = variant === "compact";

  return (
    <article className={`group relative overflow-hidden border border-[#063f5b]/8 bg-white shadow-[0_16px_36px_-28px_rgba(6,63,91,.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_42px_-26px_rgba(6,63,91,.35)] ${compact ? "rounded-2xl sm:rounded-[2rem]" : "rounded-[2rem]"}`}>
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#009dcc]" />
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-[#e8f8fc]">
        <div className="absolute right-2 top-2 z-20 sm:right-4 sm:top-4"><CardFavoriteButton kind="product" id={product.id} label={product.name} /></div>
        <div className="absolute -right-12 -top-12 size-40 rounded-full bg-[#a8e8f5]/75 transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute -bottom-16 -left-10 size-36 rounded-full bg-white/75" />
        {product.badge && (
          <span className={`absolute z-10 rounded-full bg-white font-extrabold text-[#009dcc] shadow-sm ${compact ? "left-2 top-2 px-2 py-1 text-[10px] sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs" : "left-5 top-5 px-3 py-1.5 text-xs"}`}>
            {product.badge}
          </span>
        )}
        <ProductImage product={product} variant={compact ? "featured" : "card"} />
      </div>
      <div className={compact ? "p-3 sm:p-5" : "p-6"}>
        <h3 className={`font-extrabold tracking-[-0.03em] text-[#063f5b] ${compact ? "text-sm leading-5 sm:text-lg sm:leading-6" : "text-xl"}`}>{product.name}</h3>
        <p className={compact ? "mt-2 line-clamp-3 text-xs leading-5 text-[#063f5b]/65 sm:text-sm sm:leading-6" : "mt-2 min-h-18 text-sm leading-6 text-[#063f5b]/65"}>{product.summary}</p>
        <div className={`border-t border-[#063f5b]/8 ${compact ? "mt-3 pt-3 sm:mt-4 sm:pt-4" : "mt-5 pt-5"}`}>
          <p className={`font-extrabold uppercase tracking-[0.12em] text-[#063f5b]/45 ${compact ? "text-[9px] sm:text-[11px]" : "text-xs"}`}>{hasLiveOffers ? "Shop from" : "Offer status"}</p>
          {hasLiveOffers ? (
            <div className={`flex flex-wrap ${compact ? "mt-2 gap-1" : "mt-3 gap-2"}`}>
              {merchantNames.map((merchantName) => (
                <span key={merchantName} className={`rounded-full bg-[#f1fbfe] font-bold text-[#063f5b] ${compact ? "px-2 py-1 text-[9px] sm:text-[11px]" : "px-3 py-1.5 text-xs"}`}>
                  {merchantName}
                </span>
              ))}
            </div>
          ) : (
            <p className={`${compact ? "mt-2 text-xs" : "mt-3 text-sm"} font-semibold text-[#063f5b]/55`}>Offers temporarily unavailable</p>
          )}
          <span className={`inline-flex items-center gap-2 font-extrabold text-[#009dcc] transition-colors group-hover:text-[#0784b0] ${compact ? "mt-3 text-xs sm:mt-4 sm:text-sm" : "mt-5 text-sm"}`}>
            View product <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </article>
  );
}
