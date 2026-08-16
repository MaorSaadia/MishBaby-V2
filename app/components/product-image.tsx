import Image from "next/image";
import type { Product, ProductVisual } from "@/lib/products";

type ProductImageProps = {
  product: Product;
  variant?: "card" | "detail";
  priority?: boolean;
};

function FallbackArtwork({ visual, variant }: { visual: ProductVisual; variant: "card" | "detail" }) {
  const className = `relative text-[#009dcc] ${variant === "detail" ? "size-40" : "size-24"}`;
  const commonProps = {
    viewBox: "0 0 96 96",
    className,
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: variant === "detail" ? 2.5 : 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (visual === "changing-mat") {
    return (
      <svg {...commonProps}>
        <path d="M18 27c0-5 4-9 9-9h42c5 0 9 4 9 9v42c0 5-4 9-9 9H27c-5 0-9-4-9-9V27Z" />
        <path d="M32 18v60M64 18v60M23 55h50" />
        <path d="M43 37h10M48 32v10" />
      </svg>
    );
  }

  if (visual === "grooming-kit") {
    return (
      <svg {...commonProps}>
        <path d="M20 38h56v35c0 5-4 9-9 9H29c-5 0-9-4-9-9V38Z" />
        <path d="M35 38v-8c0-5 4-9 9-9h8c5 0 9 4 9 9v8M20 52h56" />
        <path d="M35 63v9M42 61v11M49 64v8M63 61v11" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M28 21h19c11 0 20 9 20 20v13H36c-4 0-8-3-9-7l-6-20c-1-3 2-6 7-6Z" />
      <path d="M67 54 58 72H35M30 54l8 18M23 72h44" />
      <circle cx="33" cy="78" r="6" />
      <circle cx="65" cy="78" r="6" />
      <path d="M67 41h9" />
    </svg>
  );
}

export function ProductImage({ product, variant = "card", priority = false }: ProductImageProps) {
  if (product.image) {
    return (
      <Image
        src={product.image.src}
        alt={product.image.alt}
        fill
        priority={priority}
        sizes={variant === "detail" ? "(max-width: 1024px) 100vw, 45vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        className={`object-contain ${variant === "detail" ? "p-10 sm:p-14" : "p-8"}`}
      />
    );
  }

  return <FallbackArtwork visual={product.fallbackVisual} variant={variant} />;
}
