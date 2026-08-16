import type { Offer } from "@/lib/products";
import { getMerchant } from "@/lib/products";

type OfferComparisonProps = {
  offers: Offer[];
};

export function OfferComparison({ offers }: OfferComparisonProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#063f5b]/10 bg-white shadow-[0_18px_42px_-30px_rgba(6,63,91,.4)]">
      <div className="border-b border-[#063f5b]/8 bg-[#f7fcfe] px-6 py-5 sm:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#009dcc]">Available merchants</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-[#063f5b]">Compare your options</h2>
      </div>
      <div className="divide-y divide-[#063f5b]/8">
        {offers.map((offer) => {
          const merchant = getMerchant(offer.merchantId);

          if (!merchant) return null;

          return (
            <div key={offer.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e2f7fc] text-sm font-black text-[#009dcc]">{merchant.name.charAt(0)}</span>
                <div>
                  <h3 className="font-extrabold text-[#063f5b]">{merchant.name}</h3>
                  <p className="mt-1 text-sm text-[#063f5b]/55">Offer details will be added when this merchant is connected.</p>
                </div>
              </div>
              <span className="w-fit shrink-0 rounded-full bg-[#eef4f6] px-4 py-2 text-xs font-extrabold text-[#063f5b]/55">Coming soon</span>
            </div>
          );
        })}
      </div>
      <p className="border-t border-[#063f5b]/8 px-6 py-4 text-xs leading-5 text-[#063f5b]/50 sm:px-8">MishBaby may earn a commission from qualifying purchases at no additional cost to you.</p>
    </div>
  );
}
