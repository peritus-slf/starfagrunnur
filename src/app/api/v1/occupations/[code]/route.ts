import { NextRequest, NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { withRouteHandler } from "@/lib/route";

export const GET = withRouteHandler(async function (
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!/^\d{1,4}$/.test(code)) {
    return NextResponse.json(
      { detail: "Ógildur starfaflokkskóði" },
      { status: 400 }
    );
  }

  const rows = await runQuery(
    `MATCH (g:OccupationGroup {code: $code})
     OPTIONAL MATCH (g)-[:CHILD_OF]->(parent:OccupationGroup)
     RETURN g.code AS code, g.title AS title, g.level AS level,
            g.source_system AS source_system,
            g.description_is AS description,
            g.tasks AS tasks,
            g.example_titles AS example_titles,
            g.notes AS notes,
            parent.code AS parent_code, parent.title AS parent_title,
            parent.level AS parent_level`,
    { code }
  );

  if (rows.length === 0) {
    return NextResponse.json(
      { detail: `Starfaflokkur '${code}' fannst ekki` },
      { status: 404 }
    );
  }

  const r = rows[0] as Record<string, unknown>;

  return NextResponse.json({
    code: r.code,
    title: r.title,
    level: r.level,
    source_system: r.source_system,
    parent: r.parent_code
      ? { code: r.parent_code, title: r.parent_title, level: r.parent_level }
      : null,
    description: r.description || null,
    tasks: r.tasks || null,
    example_titles: r.example_titles || null,
    notes: r.notes || null,
  });
});
