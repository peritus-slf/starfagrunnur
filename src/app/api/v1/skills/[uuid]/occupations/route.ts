import { NextRequest, NextResponse } from "next/server";
import neo4j from "neo4j-driver";
import { runQuery } from "@/lib/neo4j";
import { withRouteHandler } from "@/lib/route";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PAGE_SIZE = 200;
const VALID_RELATION_TYPES = new Set(["essential", "optional"]);

export const GET = withRouteHandler(async function (
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const sp = request.nextUrl.searchParams;

  if (!UUID_RE.test(uuid)) {
    return NextResponse.json({ detail: "Ógildur UUID" }, { status: 400 });
  }

  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(sp.get("page_size") || "50", 10) || 50)
  );
  const relationType = sp.get("relation_type") || null;

  if (relationType && !VALID_RELATION_TYPES.has(relationType)) {
    return NextResponse.json(
      { detail: `Ógilt relation_type: ${relationType}` },
      { status: 400 }
    );
  }

  const uri = `http://data.europa.eu/esco/skill/${uuid}`;
  const skip = (page - 1) * pageSize;

  const queryParams = {
    uri,
    relation_type: relationType,
    skip: neo4j.int(skip),
    limit: neo4j.int(pageSize),
  };

  const countRows = await runQuery<{ total: number }>(
    `MATCH (s:Skill {conceptUri: $uri})<-[r:REQUIRES_SKILL]-(occ:EscoOccupation)
     WHERE $relation_type IS NULL OR r.relationType = $relation_type
     RETURN count(*) AS total`,
    queryParams
  );
  const total = countRows[0]?.total ?? 0;

  if (total === 0) {
    return NextResponse.json({
      items: [],
      total: 0,
      page,
      page_size: pageSize,
      total_pages: 0,
    });
  }

  const items = await runQuery(
    `MATCH (s:Skill {conceptUri: $uri})<-[r:REQUIRES_SKILL]-(occ:EscoOccupation)
     WHERE $relation_type IS NULL OR r.relationType = $relation_type
     OPTIONAL MATCH (occ)-[:BELONGS_TO_GROUP]->(g:OccupationGroup)
     RETURN split(occ.conceptUri, '/')[-1] AS uuid,
            occ.conceptUri AS conceptUri,
            occ.preferredLabel_is AS preferredLabel_is,
            occ.iscoGroup AS iscoGroup,
            r.relationType AS relationType,
            g.code AS group_code,
            g.title AS group_title
     ORDER BY r.relationType, occ.preferredLabel_is
     SKIP $skip LIMIT $limit`,
    queryParams
  );

  return NextResponse.json({
    items,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  });
});
