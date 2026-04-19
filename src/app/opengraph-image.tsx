import { ImageResponse } from "next/og";

// Generated at build time by Next.js; served at /opengraph-image
// and referenced automatically by metadata.openGraph.images.
export const runtime = "nodejs";
export const alt = "Starfagrunnur — Opinn gagnagrunnur um störf og hæfni";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0f1014",
          color: "#e8e4dc",
          fontFamily: "serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              height: "2px",
              width: "48px",
              background: "#c9a84c",
              display: "block",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "14px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#c9a84c",
            }}
          >
            Opinn gagnagrunnur
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <h1
            style={{
              fontSize: "88px",
              fontWeight: 700,
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            Starfagrunnur{" "}
            <span style={{ color: "#c9a84c", fontStyle: "italic" }}>íslenska</span>{" "}
            starfakerfisins
          </h1>
          <p
            style={{
              fontSize: "28px",
              fontWeight: 300,
              color: "#a0998d",
              margin: 0,
              maxWidth: "900px",
            }}
          >
            ÍSTARF21 + ESCO í opnu REST API. 578 starfaflokkar, 3.039 starfsheiti, 13.939 hæfnieiningar.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "monospace",
            fontSize: "16px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#6b6558",
          }}
        >
          <span>starfagrunnur.is</span>
          <span>api.starfagrunnur.is</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
