import Link from "next/link";
import type { Product } from "@/lib/products";
import { getProductPath } from "@/lib/product-urls";
import { CardFavoriteButton } from "./card-favorite-button";
import { ProductImage } from "./product-image";

type BestSellerCardProps = {
  product: Product;
  rank: number;
};

export function BestSellerCard({ product, rank }: BestSellerCardProps) {
  const merchantNames = product.offers.map((offer) => offer.merchant.name);

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-[#063f5b]/8 bg-white shadow-[0_14px_30px_-24px_rgba(6,63,91,.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_36px_-24px_rgba(6,63,91,.4)]">
      <Link
        href={getProductPath(product.slug)}
        aria-label={`View ${product.name}`}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-[#009dcc]"
      />

      <div className="relative grid aspect-[16/11] place-items-center overflow-hidden bg-[#e8f8fc]">
        <span className="absolute left-2 top-2 z-20 rounded-full bg-[#063f5b] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-white shadow-sm sm:text-[10px]">
          #{rank}
          <span className="hidden sm:inline"> Best Seller</span>
        </span>
        <div className="absolute right-2 top-2 z-20">
          <CardFavoriteButton
            kind="product"
            id={product.id}
            label={product.name}
          />
        </div>
        <ProductImage product={product} variant="featured" />
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-extrabold leading-5 tracking-[-0.025em] text-[#063f5b] sm:text-base sm:leading-5">
          {product.name}
        </h3>
        <div className="mt-3 border-t border-[#063f5b]/8 pt-3">
          {/* <p className="truncate text-[9px] font-bold uppercase tracking-[0.1em] text-[#063f5b]/50 sm:text-[10px]">
            {merchantNames.length > 0 ? `Available from ${merchantNames.join(" · ")}` : "Offers temporarily unavailable"}
          </p> */}
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-[#009dcc] transition-colors group-hover:text-[#0784b0]">
            View product <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </article>
  );
}
