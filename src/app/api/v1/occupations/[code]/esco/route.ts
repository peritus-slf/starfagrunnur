import { NextRequest, NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { withRouteHandler } from "@/lib/route";

export const GET = withRouteHandler(async function (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const recursive = request.nextUrl.searchParams.get("recursive") === "true";

  if (!/^\d{1,4}$/.test(code)) {
    return NextResponse.json({ detail: "Ógildur kóði" }, { status: 400 });
  }

  // Direct: ESCOs attached to this exact group (only non-empty for level-4 groups).
  // Recursive: walk down to every level-4 descendant and union their ESCOs.
  const cypher = recursive
    ? `MATCH (root:OccupationGroup {code: $code})
       MATCH (leaf:OccupationGroup {level: 4})
       WHERE leaf = root OR (leaf)-[:CHILD_OF*1..3]->(root)
       MATCH (leaf)<-[:BELONGS_TO_GROUP]-(occ:EscoOccupation)
       RETURN occ.conceptUri AS conceptUri,
              occ.preferredLabel_is AS preferredLabel_is,
              occ.description_is AS description_is,
              occ.iscoGroup AS iscoGroup,
              leaf.code AS group_code,
              leaf.title AS group_title
       ORDER BY occ.preferredLabel_is`
    : `MATCH (g:OccupationGroup {code: $code})
         <-[:BELONGS_TO_GROUP]-(occ:EscoOccupation)
       RETURN occ.conceptUri AS conceptUri,
              occ.preferredLabel_is AS preferredLabel_is,
              occ.description_is AS description_is,
              occ.iscoGroup AS iscoGroup
       ORDER BY occ.preferredLabel_is`;

  const rows = await runQuery(cypher, { code });
  return NextResponse.json(rows);
});
