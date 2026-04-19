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
    `MATCH (g:OccupationGroup {code: $code})
     MATCH path = (g)-[:CHILD_OF*1..4]->(ancestor:OccupationGroup)
     WITH ancestor, length(path) AS distance
     ORDER BY distance ASC
     RETURN ancestor.code AS code, ancestor.title AS title, ancestor.level AS level`,
    { code }
  );

  return NextResponse.json(rows);
});
