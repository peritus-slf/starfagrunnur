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

  const uri = `http://data.europa.eu/esco/skill/${uuid}`;

  const rows = await runQuery(
    `MATCH (s:Skill {conceptUri: $uri})
     OPTIONAL MATCH (s)<-[r:REQUIRES_SKILL]-(:EscoOccupation)
     WITH s,
          sum(CASE r.relationType WHEN 'essential' THEN 1 ELSE 0 END) AS essential_count,
          sum(CASE r.relationType WHEN 'optional' THEN 1 ELSE 0 END) AS optional_count
     RETURN s.conceptUri AS conceptUri,
            s.preferredLabel_is AS preferredLabel_is,
            s.skillType AS skillType,
            s.description_is AS description_is,
            essential_count,
            optional_count`,
    { uri }
  );

  if (rows.length === 0) {
    return NextResponse.json(
      { detail: `Skill '${uuid}' fannst ekki` },
      { status: 404 }
    );
  }

  const r = rows[0] as Record<string, unknown>;
  return NextResponse.json({
    conceptUri: r.conceptUri,
    uuid,
    preferredLabel_is: r.preferredLabel_is,
    skillType: r.skillType,
    description_is: r.description_is || null,
    occupations: {
      essential_count: r.essential_count,
      optional_count: r.optional_count,
    },
  });
});
