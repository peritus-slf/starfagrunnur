"use client";

import { useEffect } from "react";

const CSS_URL = "/swagger/swagger-ui.css";
const BUNDLE_URL = "/swagger/swagger-ui-bundle.js";
const PRESET_URL = "/swagger/swagger-ui-standalone-preset.js";

declare global {
  interface Window {
    SwaggerUIBundle?: unknown;
    SwaggerUIStandalonePreset?: unknown;
    ui?: unknown;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error(src)), { once: true });
      }
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = "true";
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

function loadStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

export default function DocsClient() {
  useEffect(() => {
    let cancelled = false;
    loadStylesheet(CSS_URL);
    (async () => {
      try {
        await loadScript(BUNDLE_URL);
        await loadScript(PRESET_URL);
        if (cancelled) return;
        const SwaggerUIBundle = (window.SwaggerUIBundle ?? null) as
          | (((opts: Record<string, unknown>) => unknown) & {
              presets: { apis: unknown };
            })
          | null;
        const SwaggerUIStandalonePreset = window.SwaggerUIStandalonePreset ?? null;
        if (!SwaggerUIBundle) {
          console.error("SwaggerUIBundle failed to load");
          return;
        }
        window.ui = SwaggerUIBundle({
          url: "/openapi.yaml",
          dom_id: "#swagger-ui",
          deepLinking: true,
          docExpansion: "list",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset].filter(Boolean),
          layout: "BaseLayout",
        });
      } catch (err) {
        console.error("Swagger UI load failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <main id="swagger-ui" style={{ minHeight: "100vh", background: "#fafafa" }} />;
}
