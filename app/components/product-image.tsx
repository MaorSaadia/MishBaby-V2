import Image from "next/image";
import type { Product } from "@/lib/products";

type ProductImageProps = {
  product: Product;
  variant?: "card" | "featured" | "detail";
  preload?: boolean;
};

function FallbackArtwork({ variant }: { variant: "card" | "featured" | "detail" }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`relative text-[#009dcc] ${variant === "detail" ? "size-40" : "size-24"}`}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={variant === "detail" ? 2.5 : 3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 35 48 20l27 15v34c0 7-5 12-12 12H33c-7 0-12-5-12-12V35Z" />
      <path d="M36 52c0-5 4-9 9-9 3 0 5 1 7 4 2-3 4-4 7-4 5 0 9 4 9 9 0 9-16 17-16 17S36 61 36 52Z" />
    </svg>
  );
}

export function ProductImage({ product, variant = "card", preload = false }: ProductImageProps) {
  if (product.image) {
    return (
      <Image
        src={product.image.src}
        alt={product.image.alt}
        fill
        preload={preload}
        placeholder={product.image.blurDataURL ? "blur" : "empty"}
        blurDataURL={product.image.blurDataURL}
        sizes={
          variant === "detail"
            ? "(max-width: 1024px) 100vw, 528px"
            : variant === "featured"
              ? "(max-width: 1024px) 50vw, 272px"
              : "(max-width: 1024px) 50vw, 352px"
        }
        className="object-cover"
      />
    );
  }

  return <FallbackArtwork variant={variant} />;
}
