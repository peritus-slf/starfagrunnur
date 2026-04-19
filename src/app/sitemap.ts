import type { MetadataRoute } from "next";
import { runQuery } from "@/lib/neo4j";

const BASE = "https://starfagrunnur.is";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,   changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/docs`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/um`, changeFrequency: "monthly", priority: 0.6 },
  ];

  // One entry per ÍSTARF21 code. Graceful fallback if Neo4j is unreachable
  // at build time — the static routes still ship, and per-code pages will
  // appear on the next rebuild.
  try {
    const rows = await runQuery<{ code: string }>(
      `MATCH (g:OccupationGroup) RETURN g.code AS code`
    );
    const occRoutes: MetadataRoute.Sitemap = rows.map((r) => ({
      url: `${BASE}/starfaflokkur/${r.code}`,
      changeFrequency: "monthly",
      priority: 0.5,
    }));
    return [...staticRoutes, ...occRoutes];
  } catch {
    return staticRoutes;
  }
}
