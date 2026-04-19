import type { NextConfig } from "next";

// Baseline security headers applied to every response.
const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// Content-Security-Policy scoped to the HTML/app pages.
// Swagger UI assets are self-hosted under /swagger/* so 'self' is sufficient for script/style.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // unsafe-inline needed for Next.js theme/hydration scripts
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

// CORS: public, read-only, anonymous API — permissive by design.
const corsHeaders = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, Accept" },
  { key: "Access-Control-Max-Age", value: "86400" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Page routes: full security header set + CSP.
        source: "/:path((?!api/).*)",
        headers: [
          ...baseSecurityHeaders,
          { key: "Content-Security-Policy", value: cspDirectives },
        ],
      },
      {
        // API routes: baseline security headers + CORS (no CSP — JSON response).
        source: "/api/:path*",
        headers: [...baseSecurityHeaders, ...corsHeaders],
      },
    ];
  },
};

export default nextConfig;
