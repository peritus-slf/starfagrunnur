import { ImageResponse } from "next/og";

// Favicon generated at build time by Next.js; served at /icon
// and picked up automatically by the browser (beats /favicon.ico if present).
export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// A minimal knowledge-graph mark:
//   one "parent" node (ÍSTARF category) at top,
//   two "child" nodes (ESCO role + skill) below, connected by edges.
// Amber on the brand near-black, so it reads at 16px in a browser tab.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0f1014",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* edges */}
          <line x1="16" y1="9" x2="9" y2="23" stroke="#c9a84c" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="16" y1="9" x2="23" y2="23" stroke="#c9a84c" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="9" y1="23" x2="23" y2="23" stroke="#c9a84c" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.55" />
          {/* parent node (ÍSTARF) */}
          <circle cx="16" cy="9" r="4" fill="#c9a84c" />
          {/* child nodes (ESCO role, skill) */}
          <circle cx="9" cy="23" r="3.25" fill="#c9a84c" />
          <circle cx="23" cy="23" r="3.25" fill="#c9a84c" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
