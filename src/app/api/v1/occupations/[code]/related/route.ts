import { NextRequest, NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { withRouteHandler } from "@/lib/route";

export const GET = withRouteHandler(async function (
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!/^\d{1,4}$/.test(code)) {
    return NextResponse.json({ detail: "Ógildur kóði" }, { status: 400 });
  }

  const rows = await runQuery(
    `MATCH (g:OccupationGroup {code: $code})-[:RELATED_TO]->(related:OccupationGroup)
     RETURN related.code AS code, related.title AS title, related.level AS level
     ORDER BY related.code`,
    { code }
  );

  return NextResponse.json(rows);
});
