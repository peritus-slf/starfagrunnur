import { NextRequest, NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { withRouteHandler } from "@/lib/route";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const GET = withRouteHandler(async function (
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  if (!UUID_RE.test(uuid)) {
    return NextResponse.json({ detail: "Ógildur UUID" }, { status: 400 });
  }

  const uri = `http://data.europa.eu/esco/occupation/${uuid}`;

  const rows = await runQuery(
    `MATCH (occ:EscoOccupation {conceptUri: $uri})
     OPTIONAL MATCH (occ)-[:BELONGS_TO_GROUP]->(g:OccupationGroup)
     OPTIONAL MATCH (occ)<-[:ALIAS_OF]-(alias:AliasTerm)
     OPTIONAL MATCH (occ)-[r:REQUIRES_SKILL]->(:Skill)
     WITH occ, g,
          collect(DISTINCT alias.label) AS aliases,
          sum(CASE r.relationType WHEN 'essential' THEN 1 ELSE 0 END) AS essential_count,
          sum(CASE r.relationType WHEN 'optional' THEN 1 ELSE 0 END) AS optional_count
     RETURN occ.conceptUri AS conceptUri,
            occ.preferredLabel_is AS preferredLabel_is,
            occ.description_is AS description_is,
            occ.iscoGroup AS iscoGroup,
            aliases,
            essential_count,
            optional_count,
            g.code AS group_code,
            g.title AS group_title,
            g.level AS group_level`,
    { uri }
  );

  if (rows.length === 0) {
    return NextResponse.json(
      { detail: `ESCO occupation '${uuid}' fannst ekki` },
      { status: 404 }
    );
  }

  const r = rows[0] as Record<string, unknown>;

  // Ancestor chain of the parent ÍSTARF group (if any)
  let ancestors: Array<{ code: string; title: string; level: number }> = [];
  if (r.group_code) {
    const ancRows = await runQuery<{
      code: string;
      title: string;
      level: number;
    }>(
      `MATCH (g:OccupationGroup {code: $code})
       MATCH path = (g)-[:CHILD_OF*1..4]->(ancestor:OccupationGroup)
       WITH ancestor, length(path) AS distance
       ORDER BY distance ASC
       RETURN ancestor.code AS code, ancestor.title AS title, ancestor.level AS level`,
      { code: r.group_code }
    );
    ancestors = ancRows;
  }

  return NextResponse.json({
    conceptUri: r.conceptUri,
    uuid,
    preferredLabel_is: r.preferredLabel_is,
    description_is: r.description_is || null,
    iscoGroup: r.iscoGroup,
    aliases: r.aliases || [],
    skills: {
      essential_count: r.essential_count,
      optional_count: r.optional_count,
    },
    group: r.group_code
      ? {
          code: r.group_code,
          title: r.group_title,
          level: r.group_level,
          ancestors,
        }
      : null,
  });
});
