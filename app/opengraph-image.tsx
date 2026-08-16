import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "MishBaby — thoughtful finds for little ones";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        overflow: "hidden",
        background: "#f1fbfe",
        color: "#063f5b",
        padding: "76px 88px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ position: "absolute", right: -80, top: -100, width: 430, height: 430, borderRadius: 999, background: "#a8e8f5" }} />
      <div style={{ position: "absolute", left: -100, bottom: -180, width: 420, height: 420, borderRadius: 999, background: "#d9f4ee" }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", width: 760 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", width: 64, height: 64, alignItems: "center", justifyContent: "center", borderRadius: 999, background: "#009dcc", color: "white", fontSize: 24, fontWeight: 700 }}>MB</div>
          <div style={{ display: "flex", fontSize: 42, fontWeight: 700, letterSpacing: -2 }}>{siteConfig.name}</div>
        </div>
        <div style={{ display: "flex", marginTop: 54, fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>Good things for your little love.</div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 28, lineHeight: 1.4, color: "#376579" }}>Thoughtful product discovery and practical guidance for growing families.</div>
      </div>
      <div style={{ position: "absolute", right: 100, bottom: 78, display: "flex", alignItems: "center", justifyContent: "center", width: 210, height: 210, borderRadius: 48, background: "#009dcc", color: "white", fontSize: 62, fontWeight: 700, letterSpacing: -4 }}>MB</div>
    </div>,
    size,
  );
}
