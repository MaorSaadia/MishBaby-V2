"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { ProductCard } from "./product-card";

type HomepageProductRailProps = {
  products: Product[];
  label: string;
};

export function HomepageProductRail({ products, label }: HomepageProductRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const railId = useId();
  const [canMoveBackward, setCanMoveBackward] = useState(false);
  const [canMoveForward, setCanMoveForward] = useState(false);

  const updateControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const maximumScroll = rail.scrollWidth - rail.clientWidth;
    setCanMoveBackward(rail.scrollLeft > 2);
    setCanMoveForward(maximumScroll - rail.scrollLeft > 2);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    updateControls();
    rail.addEventListener("scroll", updateControls, { passive: true });
    const resizeObserver = new ResizeObserver(updateControls);
    resizeObserver.observe(rail);

    return () => {
      rail.removeEventListener("scroll", updateControls);
      resizeObserver.disconnect();
    };
  }, [products.length, updateControls]);

  function moveRail(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.82, 240),
      behavior: "smooth",
    });
  }

  if (products.length === 0) return null;

  return (
    <div className="relative mt-6 sm:mt-8">
      <div
        id={railId}
        ref={railRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
        aria-label={label}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[calc((100%_-_0.75rem)/2)] shrink-0 snap-start [&>article]:h-full sm:w-[calc((100%_-_2.5rem)/3)] lg:w-[calc((100%_-_5rem)/5)]"
          >
            <ProductCard product={product} variant="compact" />
          </div>
        ))}
      </div>

      {products.length > 5 && (
        <>
          <button
            type="button"
            onClick={() => moveRail(-1)}
            disabled={!canMoveBackward}
            aria-controls={railId}
            aria-label={`Show previous ${label.toLowerCase()}`}
            className="absolute left-2 top-1/2 z-30 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#063f5b]/10 bg-white/95 text-xl font-bold text-[#063f5b] shadow-lg transition hover:scale-105 hover:text-[#009dcc] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#009dcc] disabled:pointer-events-none disabled:opacity-40 sm:flex"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={() => moveRail(1)}
            disabled={!canMoveForward}
            aria-controls={railId}
            aria-label={`Show more ${label.toLowerCase()}`}
            className="absolute right-2 top-1/2 z-30 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#063f5b]/10 bg-white/95 text-xl font-bold text-[#063f5b] shadow-lg transition hover:scale-105 hover:text-[#009dcc] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#009dcc] disabled:pointer-events-none disabled:opacity-40 sm:flex"
          >
            <span aria-hidden="true">→</span>
          </button>
        </>
      )}
    </div>
  );
}
