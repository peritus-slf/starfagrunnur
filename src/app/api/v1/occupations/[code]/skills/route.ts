import { NextRequest, NextResponse } from "next/server";
import neo4j from "neo4j-driver";
import { runQuery } from "@/lib/neo4j";
import { withRouteHandler } from "@/lib/route";

const MAX_PAGE_SIZE = 200;
const VALID_RELATION_TYPES = new Set(["essential", "optional"]);
const VALID_SKILL_TYPES = new Set(["skill/competence", "knowledge"]);

export const GET = withRouteHandler(async function (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const sp = request.nextUrl.searchParams;

  if (!/^\d{1,4}$/.test(code)) {
    return NextResponse.json({ detail: "Ógildur kóði" }, { status: 400 });
  }

  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(sp.get("page_size") || "50", 10) || 50)
  );
  const relationType = sp.get("relation_type") || null;
  const skillType = sp.get("skill_type") || null;
  const occupationLabel = sp.get("occupation") || null;

  if (relationType && !VALID_RELATION_TYPES.has(relationType)) {
    return NextResponse.json(
      { detail: `Ógilt relation_type: ${relationType}` },
      { status: 400 }
    );
  }
  if (skillType && !VALID_SKILL_TYPES.has(skillType)) {
    return NextResponse.json(
      { detail: `Ógilt skill_type: ${skillType}` },
      { status: 400 }
    );
  }

  const skip = (page - 1) * pageSize;

  const whereClause =
    "WHERE ($relation_type IS NULL OR r.relationType = $relation_type)" +
    " AND ($skill_type IS NULL OR s.skillType = $skill_type)" +
    " AND ($occupation_label IS NULL OR occ.preferredLabel_is = $occupation_label)";

  const queryParams = {
    code,
    relation_type: relationType,
    skill_type: skillType,
    occupation_label: occupationLabel,
    skip: neo4j.int(skip),
    limit: neo4j.int(pageSize),
  };

  // Count
  const countRows = await runQuery<{ total: number }>(
    `MATCH (g:OccupationGroup {code: $code})
       <-[:BELONGS_TO_GROUP]-(occ:EscoOccupation)
       -[r:REQUIRES_SKILL]->(s:Skill)
     ${whereClause}
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

  // Items
  const items = await runQuery(
    `MATCH (g:OccupationGroup {code: $code})
       <-[:BELONGS_TO_GROUP]-(occ:EscoOccupation)
       -[r:REQUIRES_SKILL]->(s:Skill)
     ${whereClause}
     WITH occ.preferredLabel_is AS occupation,
          s.preferredLabel_is AS skill_label,
          s.skillType AS skill_type_val,
          s.description_is AS description,
          r.relationType AS relation_type_val
     ORDER BY relation_type_val, skill_label
     SKIP $skip LIMIT $limit
     RETURN skill_label AS preferredLabel_is,
            skill_type_val AS skillType,
            description AS description_is,
            relation_type_val AS relationType,
            occupation`,
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
