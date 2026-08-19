import Image from "next/image";
import { getCategoryThemeClass } from "@/lib/category-themes";
import type { Guide } from "@/lib/guides";

type GuideImageProps = {
  guide: Guide;
  variant: "featured" | "card" | "related" | "detail";
  preload?: boolean;
};

const variantClasses = {
  featured: "min-h-72 text-7xl",
  card: "h-36 text-4xl",
  related: "h-32 text-4xl",
  detail: "mt-10 aspect-[16/9] overflow-hidden rounded-[2rem] text-7xl shadow-[0_24px_55px_-38px_rgba(6,63,91,.45)]",
};

const variantSizes = {
  featured: "(max-width: 768px) 100vw, 42vw",
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 352px",
  related: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 352px",
  detail: "(max-width: 896px) 100vw, 896px",
};

export function GuideImage({ guide, variant, preload = false }: GuideImageProps) {
  if (!guide.coverImage && variant === "detail") return null;

  return (
    <div className={`relative grid place-items-center ${getCategoryThemeClass(guide.colorTheme)} ${variantClasses[variant]} text-[#009dcc]`}>
      {guide.coverImage ? (
        <Image
          src={guide.coverImage.src}
          alt={guide.coverImage.alt}
          fill
          preload={preload}
          placeholder={guide.coverImage.blurDataURL ? "blur" : "empty"}
          blurDataURL={guide.coverImage.blurDataURL}
          sizes={variantSizes[variant]}
          className="object-cover"
        />
      ) : (
        <span aria-hidden="true">{guide.symbol}</span>
      )}
    </div>
  );
}
