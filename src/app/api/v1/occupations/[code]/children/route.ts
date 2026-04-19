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
    `MATCH (child:OccupationGroup)-[:CHILD_OF]->(:OccupationGroup {code: $code})
     RETURN child.code AS code, child.title AS title, child.level AS level
     ORDER BY child.code`,
    { code }
  );

  return NextResponse.json(rows);
});
