import { ImageResponse } from "next/og";
import { getCategoryBySlug } from "@/lib/categories";
import { getProductBySlug } from "@/lib/products";

export const alt = "MishBaby product preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProductOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const category = product ? await getCategoryBySlug(product.categorySlug) : null;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#f1fbfe",
        color: "#063f5b",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 570,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#dff4f8",
          padding: 46,
        }}
      >
        {product?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image.src}
            alt=""
            width="478"
            height="538"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 34,
              objectFit: "contain",
              background: "white",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: 250,
              height: 250,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 62,
              background: "#009dcc",
              color: "white",
              fontSize: 76,
              fontWeight: 800,
            }}
          >
            MB
          </div>
        )}
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          padding: "58px 64px",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -90,
            top: -100,
            width: 310,
            height: 310,
            borderRadius: 999,
            background: "#a8e8f5",
            opacity: 0.7,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              width: 50,
              height: 50,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              background: "#009dcc",
              color: "white",
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            MB
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800 }}>MishBaby</div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 52,
            color: "#0087ad",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 2.5,
            textTransform: "uppercase",
          }}
        >
          {category?.name ?? "Thoughtful product find"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: product && product.name.length > 54 ? 49 : 58,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: -2.5,
          }}
        >
          {product?.name ?? "Thoughtful finds for little ones"}
        </div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 23, color: "#376579" }}>
          Thoughtful finds and merchant options for parents
        </div>
      </div>
    </div>,
    size,
  );
}
