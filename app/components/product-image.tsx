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

  if (visual === "baby-socks") {
    return (
      <svg {...commonProps}>
        <path d="M28 18v31c0 8-3 13-8 20-4 6 0 14 8 14h15c7 0 12-5 12-12V52H41V18H28Z" />
        <path d="M55 18v31c0 8 3 13 8 20 4 6 0 14-8 14H40c-7 0-12-5-12-12V52h14V18h13Z" />
        <path d="M27 30h15M54 30H41" />
      </svg>
    );
  }

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

  if (visual === "frog-urinal") {
    return (
      <svg {...commonProps}>
        <path d="M30 33c0-10 8-18 18-18s18 8 18 18v34c0 8-6 14-14 14h-8c-8 0-14-6-14-14V33Z" />
        <circle cx="31" cy="25" r="9" />
        <circle cx="65" cy="25" r="9" />
        <circle cx="31" cy="25" r="2" fill="currentColor" />
        <circle cx="65" cy="25" r="2" fill="currentColor" />
        <path d="M36 45c7 4 17 4 24 0M48 48v21M42 60h12" />
        <path d="M30 55c-7 2-11 7-12 13M66 55c7 2 11 7 12 13" />
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
    const isCover = product.image.fit === "cover";

    return (
      <Image
        src={product.image.src}
        alt={product.image.alt}
        fill
        priority={priority}
        sizes={variant === "detail" ? "(max-width: 1024px) 100vw, 45vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        className={isCover ? "object-cover" : `object-contain ${variant === "detail" ? "p-10 sm:p-14" : "p-8"}`}
      />
    );
  }

  return <FallbackArtwork visual={product.fallbackVisual} variant={variant} />;
}
