import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7c5ce0 0%, #6d4fd0 100%)",
          color: "#ffffff",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          borderRadius: 7,
        }}
      >
        ZA
      </div>
    ),
    { ...size }
  );
}
