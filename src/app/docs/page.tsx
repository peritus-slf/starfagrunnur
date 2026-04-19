import type { Metadata } from "next";
import DocsClient from "./DocsClient";

export const metadata: Metadata = {
  title: "API skjölun — Starfagrunnur REST API",
  description:
    "Gagnvirk skjölun fyrir Starfagrunnur REST API: leit, ÍSTARF21 flokkar, ESCO starfsheiti, hæfni. Engin auðkenning. OpenAPI 3.1 forskrift.",
  alternates: { canonical: "/docs" },
};

// Server-rendered shell so non-JS crawlers (and any AI agent parsing raw HTML)
// see a meaningful page even before Swagger UI hydrates.
export default function DocsPage() {
  return (
    <>
      <section
        style={{
          padding: "48px 32px 16px",
          maxWidth: 1280,
          margin: "0 auto",
          background: "#fafafa",
        }}
      >
        <h1
          style={{
            fontSize: 32,
            margin: "0 0 12px",
            fontFamily: "Georgia, serif",
            color: "#1a1a1a",
          }}
        >
          Starfagrunnur REST API
        </h1>
        <p
          style={{
            fontSize: 15,
            margin: "0 0 24px",
            color: "#555",
            lineHeight: 1.6,
            maxWidth: 720,
          }}
        >
          Opinn aðgangur að íslensku starfakerfi — ÍSTARF21 og ESCO sameinað í opnu
          REST API. Engin auðkenning, JSON svör, UTF-8. Öll svör eru lestrar (GET) og
          síðutæmd eftir þörfum.
        </p>
        <noscript>
          <p style={{ color: "#b00", marginBottom: 16 }}>
            Gagnvirka skjölunin krefst JavaScript. Þú getur líka skoðað OpenAPI
            forskriftina beint: <a href="/openapi.yaml">/openapi.yaml</a>
          </p>
        </noscript>
        <ul
          style={{
            fontSize: 14,
            lineHeight: 1.8,
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "grid",
            gap: 6,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          <li><strong>GET</strong> /api/v1/search — leit yfir ÍSTARF21 og ESCO</li>
          <li><strong>GET</strong> /api/v1/occupations — listi ÍSTARF21 flokka</li>
          <li><strong>GET</strong> /api/v1/occupations/&#123;code&#125; — upplýsingar um flokk</li>
          <li><strong>GET</strong> /api/v1/occupations/&#123;code&#125;/esco — ESCO starfsheiti í flokki</li>
          <li><strong>GET</strong> /api/v1/occupations/&#123;code&#125;/skills — hæfni í flokki</li>
          <li><strong>GET</strong> /api/v1/esco-occupations — listi/leit ESCO starfsheita</li>
          <li><strong>GET</strong> /api/v1/esco-occupations/&#123;uuid&#125; — upplýsingar um starfsheiti</li>
          <li><strong>GET</strong> /api/v1/esco-occupations/&#123;uuid&#125;/skills — hæfni fyrir starfsheiti</li>
          <li><strong>GET</strong> /api/v1/skills — listi/leit hæfnieininga</li>
          <li><strong>GET</strong> /api/v1/skills/&#123;uuid&#125; — upplýsingar um hæfni</li>
          <li><strong>GET</strong> /api/v1/skills/&#123;uuid&#125;/occupations — öfug uppfletting</li>
        </ul>
      </section>
      <DocsClient />
    </>
  );
}
