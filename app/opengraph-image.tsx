import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.seoTitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fbfbfd",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #7c5ce0 0%, #6d4fd0 100%)",
              color: "#fff",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            ZA
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#6d4fd0",
              fontWeight: 600,
            }}
          >
            {site.location}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontWeight: 700,
              color: "#0c1218",
              letterSpacing: "-0.03em",
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              color: "#5f5a68",
              marginTop: 12,
            }}
          >
            Production-ready{" "}
            <span style={{ color: "#6d4fd0", marginLeft: 12 }}>AI systems</span>
            <span style={{ marginLeft: 12 }}>for businesses</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#5f5a68",
          }}
        >
          AI agents · RAG · LLM products · Automation · AWS — Germany & remote
        </div>
      </div>
    ),
    { ...size }
  );
}
