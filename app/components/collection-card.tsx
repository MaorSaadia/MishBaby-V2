import Image from "next/image";
import Link from "next/link";
import type { ProductCollection } from "@/lib/collections";

export function CollectionArtwork({ collection, priority = false }: { collection: ProductCollection; priority?: boolean }) {
  const products = collection.products.slice(0, 3);

  return (
    <div className="grid aspect-[16/10] grid-cols-2 grid-rows-2 gap-1 overflow-hidden bg-[#dff4f8]">
      {products.map((product, index) => (
        <div key={product.id} className={`relative grid place-items-center overflow-hidden bg-[#e8f8fc] ${index === 0 || products.length === 2 ? "row-span-2" : ""}`}>
          {product.image ? (
            <Image
              src={product.image.src}
              alt=""
              fill
              priority={priority && index === 0}
              placeholder={product.image.blurDataURL ? "blur" : "empty"}
              blurDataURL={product.image.blurDataURL}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="text-3xl text-[#009dcc]" aria-hidden="true">♡</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function CollectionCard({ collection }: { collection: ProductCollection }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-[#063f5b]/8 bg-white shadow-[0_16px_36px_-28px_rgba(6,63,91,.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_42px_-26px_rgba(6,63,91,.35)]">
      <Link href={`/collections/${collection.slug}`} className="block focus-visible:outline-offset-[-3px]">
        <CollectionArtwork collection={collection} />
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#009dcc]">
            {collection.badge && <span>{collection.badge}</span>}
            <span className="text-[#063f5b]/45">{collection.products.length} products</span>
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.035em] text-[#063f5b]">{collection.name}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#063f5b]/65">{collection.description}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#009dcc]">Explore collection <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}
