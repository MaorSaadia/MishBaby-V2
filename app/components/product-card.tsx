import type { Offer, Product } from "@/lib/products";
import { getMerchant } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  offers: Offer[];
};

export function ProductCard({ product, offers }: ProductCardProps) {
  const merchantNames = offers
    .map((offer) => getMerchant(offer.merchantId)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-white shadow-[0_16px_36px_-28px_rgba(6,63,91,.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_42px_-26px_rgba(6,63,91,.35)]">
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-[#e8f8fc]">
        <div className="absolute -right-12 -top-12 size-40 rounded-full bg-[#a8e8f5]/75 transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute -bottom-16 -left-10 size-36 rounded-full bg-white/75" />
        {product.badge && <span className="absolute left-5 top-5 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[#009dcc] shadow-sm">{product.badge}</span>}
        <svg viewBox="0 0 96 96" className="relative size-24 text-[#009dcc]" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M36 21h24v13c0 4 2 8 6 11l3 3c3 3 5 7 5 12v16c0 6-5 11-11 11H33c-6 0-11-5-11-11V60c0-5 2-9 5-12l3-3c4-3 6-7 6-11V21Z" />
          <path d="M34 13h28v8H34zM30 55h36M30 68h36" />
          <path d="M43 38h10" />
        </svg>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-extrabold tracking-[-0.03em] text-[#063f5b]">{product.name}</h3>
        <p className="mt-2 min-h-18 text-sm leading-6 text-[#063f5b]/65">{product.summary}</p>
        <div className="mt-5 border-t border-[#063f5b]/8 pt-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#063f5b]/45">Offers expected from</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {merchantNames.map((merchantName) => <span key={merchantName} className="rounded-full bg-[#f1fbfe] px-3 py-1.5 text-xs font-bold text-[#063f5b]">{merchantName}</span>)}
          </div>
          <p className="mt-4 text-sm font-extrabold text-[#009dcc]">Offer comparison coming soon</p>
        </div>
      </div>
    </article>
  );
}
