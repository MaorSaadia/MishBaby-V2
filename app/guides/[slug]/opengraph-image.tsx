import { ImageResponse } from "next/og";
import { getPublishedGuideBySlug } from "@/lib/guides";

export const alt = "MishBaby parenting guide preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function GuideOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getPublishedGuideBySlug(slug);

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
        padding: "58px 62px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -120,
          bottom: -190,
          width: 430,
          height: 430,
          borderRadius: 999,
          background: "#d9f4ee",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -90,
          top: -120,
          width: 390,
          height: 390,
          borderRadius: 999,
          background: "#a8e8f5",
          opacity: 0.75,
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          width: 660,
          flexDirection: "column",
          justifyContent: "center",
          paddingRight: 54,
        }}
      >
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
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800 }}>MishBaby Guides</div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 48,
            color: "#0087ad",
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: 2.4,
            textTransform: "uppercase",
          }}
        >
          {guide?.categoryLabel ?? "Parent-friendly guidance"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: guide && guide.title.length > 62 ? 45 : 54,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: -2.2,
          }}
        >
          {guide?.title ?? "Helpful guidance for growing families"}
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 22, color: "#376579" }}>
          {guide?.readingMinutes ? `${guide.readingMinutes} minute read` : "Practical, thoughtful, and easy to explore"}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          width: 416,
          height: 514,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
          overflow: "hidden",
          borderRadius: 38,
          background: "white",
          boxShadow: "0 24px 50px rgba(6,63,91,.16)",
        }}
      >
        {guide?.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guide.coverImage.src}
            alt=""
            width="416"
            height="514"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: 190,
              height: 190,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              background: "#e8f8fc",
              color: "#009dcc",
              fontSize: 72,
              fontWeight: 800,
            }}
          >
            {guide?.symbol ?? "MB"}
          </div>
        )}
      </div>
    </div>,
    size,
  );
}
