"use client";

import { useState } from "react";
import { ProductCard } from "@/app/components/product-card";
import { productsPerBatch } from "@/lib/catalog-display";
import type { Product } from "@/lib/products";

type ProductResultsProps = {
  products: Product[];
};

export function ProductResults({ products }: ProductResultsProps) {
  const [visibleCount, setVisibleCount] = useState(productsPerBatch);
  const visibleProducts = products.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < products.length;
  const remainingProducts = Math.max(products.length - visibleProducts.length, 0);

  return (
    <>
      <div id="product-results" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMoreProducts && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            aria-controls="product-results"
            onClick={() => setVisibleCount((current) => Math.min(current + productsPerBatch, products.length))}
            className="rounded-full bg-[#009dcc] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_30px_-20px_rgba(0,157,204,.8)] transition hover:-translate-y-0.5 hover:bg-[#0784b0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#009dcc]"
          >
            Load more products
          </button>
          <p className="text-xs font-semibold text-[#063f5b]/50">
            Showing {visibleProducts.length} of {products.length} · {remainingProducts} remaining
          </p>
        </div>
      )}
    </>
  );
}
