import { NextRequest, NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { withRouteHandler } from "@/lib/route";

const VALID_LEVELS = new Set([2, 3, 4]);

export const GET = withRouteHandler(async function (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const sp = request.nextUrl.searchParams;

  if (!/^\d{1,4}$/.test(code)) {
    return NextResponse.json({ detail: "Ógildur kóði" }, { status: 400 });
  }

  const levelParam = sp.get("level");
  let levelFilter: number | null = null;
  if (levelParam !== null) {
    const parsed = parseInt(levelParam, 10);
    if (!VALID_LEVELS.has(parsed)) {
      return NextResponse.json(
        { detail: `Ógilt level: ${levelParam}. Leyfileg gildi: 2, 3, 4` },
        { status: 400 }
      );
    }
    levelFilter = parsed;
  }

  const rows = await runQuery(
    `MATCH (root:OccupationGroup {code: $code})
     MATCH (desc:OccupationGroup)-[:CHILD_OF*1..3]->(root)
     WHERE $level IS NULL OR desc.level = $level
     RETURN desc.code AS code, desc.title AS title, desc.level AS level
     ORDER BY desc.code`,
    { code, level: levelFilter }
  );

  return NextResponse.json(rows);
});
