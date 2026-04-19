import { NextRequest, NextResponse } from "next/server";
import neo4j from "neo4j-driver";
import { runQuery } from "@/lib/neo4j";
import { withRouteHandler } from "@/lib/route";

const MAX_LIMIT = 1000;
const MAX_OFFSET = 10_000;
const VALID_LEVELS = new Set([1, 2, 3, 4]);

export const GET = withRouteHandler(async function (request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const levelParam = sp.get("level");
  let level: number | null = null;
  if (levelParam !== null) {
    const parsed = parseInt(levelParam, 10);
    if (!VALID_LEVELS.has(parsed)) {
      return NextResponse.json(
        { detail: `Ógilt level: ${levelParam}. Leyfileg gildi: 1, 2, 3, 4` },
        { status: 400 }
      );
    }
    level = parsed;
  }

  const parent = sp.get("parent");
  if (parent !== null && !/^\d{1,4}$/.test(parent)) {
    return NextResponse.json({ detail: "Ógildur parent kóði" }, { status: 400 });
  }

  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(sp.get("limit") || "100", 10) || 100)
  );
  const offset = Math.min(
    MAX_OFFSET,
    Math.max(0, parseInt(sp.get("offset") || "0", 10) || 0)
  );

  // Count
  const countRows = await runQuery<{ total: number }>(
    `MATCH (g:OccupationGroup)
     ${parent ? "MATCH (g)-[:CHILD_OF]->(:OccupationGroup {code: $parent})" : ""}
     WHERE ($level IS NULL OR g.level = $level)
     RETURN count(g) AS total`,
    { level, parent }
  );
  const total = countRows[0]?.total ?? 0;

  const items = await runQuery(
    `MATCH (g:OccupationGroup)
     ${parent ? "MATCH (g)-[:CHILD_OF]->(:OccupationGroup {code: $parent})" : ""}
     WHERE ($level IS NULL OR g.level = $level)
     RETURN g.code AS code, g.title AS title, g.level AS level
     ORDER BY g.code
     SKIP $offset LIMIT $limit`,
    { level, parent, offset: neo4j.int(offset), limit: neo4j.int(limit) }
  );

  return NextResponse.json({
    items,
    total,
    limit,
    offset,
  });
});
