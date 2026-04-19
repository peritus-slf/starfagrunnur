import "server-only";
import { runQuery } from "./neo4j";

export interface Stats {
  generated_at: string;
  occupation_groups: {
    total: number;
    by_level: Record<string, number>;
  };
  esco_occupations: {
    total: number;
    bridged_to_istarf21: number;
    without_istarf21_bridge: number;
  };
  skills: {
    total: number;
    by_type: Record<string, number>;
  };
  requires_skill: {
    total: number;
    by_relation_type: Record<string, number>;
  };
  alias_terms: number;
}

/**
 * Last-resort fallback so build time and brief Neo4j outages don't break
 * the landing page render. Approximates the real numbers within a few %
 * to avoid glaring wrongness if this ever surfaces.
 */
const FALLBACK: Stats = {
  generated_at: "1970-01-01T00:00:00.000Z",
  occupation_groups: { total: 578, by_level: { "1": 9, "2": 39, "3": 121, "4": 409 } },
  esco_occupations: { total: 3039, bridged_to_istarf21: 2983, without_istarf21_bridge: 56 },
  skills: { total: 13939, by_type: { "skill/competence": 10715, knowledge: 3219, unknown: 5 } },
  requires_skill: { total: 126051, by_relation_type: { essential: 67600, optional: 58451 } },
  alias_terms: 1688,
};

/**
 * Fetch live dataset counts directly from Neo4j. Cached server-side for
 * 5 minutes via Next.js `unstable_cache` — see callers. Callers should
 * treat this as eventually-consistent, not a primary data source.
 */
export async function getStats(): Promise<Stats> {
  try {
    const [levelRows, escoRows, skillRows, relRows, miscRows] = await Promise.all([
      runQuery<{ level: number; count: number }>(
        `MATCH (g:OccupationGroup) RETURN g.level AS level, count(*) AS count ORDER BY level`
      ),
      runQuery<{ bridged: number; orphan: number }>(
        `MATCH (o:EscoOccupation)
         WITH o, exists((o)-[:BELONGS_TO_GROUP]->()) AS has_group
         RETURN sum(CASE WHEN has_group THEN 1 ELSE 0 END) AS bridged,
                sum(CASE WHEN has_group THEN 0 ELSE 1 END) AS orphan`
      ),
      runQuery<{ type: string; count: number }>(
        `MATCH (s:Skill) RETURN coalesce(s.skillType, '') AS type, count(*) AS count ORDER BY count DESC`
      ),
      runQuery<{ rel: string; count: number }>(
        `MATCH ()-[r:REQUIRES_SKILL]->() RETURN r.relationType AS rel, count(*) AS count ORDER BY count DESC`
      ),
      runQuery<{ aliases: number }>(
        `MATCH (a:AliasTerm) RETURN count(a) AS aliases`
      ),
    ]);

    const occByLevel = Object.fromEntries(levelRows.map((r) => [r.level, r.count]));
    const occTotal = levelRows.reduce((a, b) => a + b.count, 0);
    const esco = escoRows[0] ?? { bridged: 0, orphan: 0 };
    const skillByType = Object.fromEntries(
      skillRows.map((r) => [r.type || "unknown", r.count])
    );
    const skillTotal = skillRows.reduce((a, b) => a + b.count, 0);
    const relByType = Object.fromEntries(relRows.map((r) => [r.rel, r.count]));
    const relTotal = relRows.reduce((a, b) => a + b.count, 0);

    return {
      generated_at: new Date().toISOString(),
      occupation_groups: { total: occTotal, by_level: occByLevel },
      esco_occupations: {
        total: esco.bridged + esco.orphan,
        bridged_to_istarf21: esco.bridged,
        without_istarf21_bridge: esco.orphan,
      },
      skills: { total: skillTotal, by_type: skillByType },
      requires_skill: { total: relTotal, by_relation_type: relByType },
      alias_terms: miscRows[0]?.aliases ?? 0,
    };
  } catch (err) {
    console.error("[stats] Neo4j query failed, returning fallback:", err);
    return FALLBACK;
  }
}

const nfIs = new Intl.NumberFormat("is-IS");

export function formatCount(n: number): string {
  return nfIs.format(n);
}
