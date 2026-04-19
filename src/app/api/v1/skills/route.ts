import { NextRequest, NextResponse } from "next/server";
import neo4j from "neo4j-driver";
import { runQuery } from "@/lib/neo4j";
import { withRouteHandler } from "@/lib/route";

const MAX_LIMIT = 200;
const MAX_OFFSET = 20_000; // skills total ~14k; headroom without being unbounded
const MAX_QUERY_LENGTH = 200;
const VALID_SKILL_TYPES = new Set(["skill/competence", "knowledge"]);

function sanitizeFulltext(q: string): string {
  return q.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, "\\$&");
}

export const GET = withRouteHandler(async function (request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const q = sp.get("q")?.trim() || null;
  const skillType = sp.get("skill_type") || null;
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(sp.get("limit") || "50", 10) || 50)
  );
  const offset = Math.min(
    MAX_OFFSET,
    Math.max(0, parseInt(sp.get("offset") || "0", 10) || 0)
  );

  if (skillType && !VALID_SKILL_TYPES.has(skillType)) {
    return NextResponse.json(
      { detail: `Ógilt skill_type: ${skillType}` },
      { status: 400 }
    );
  }
  if (q && q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { detail: `Leitarstrengur má vera í mesta lagi ${MAX_QUERY_LENGTH} stafir.` },
      { status: 400 }
    );
  }

  // With q: full-text fuzzy search via the search_skill_label index.
  // Without q: paginated listing ordered by label.
  if (q) {
    if (q.length < 2) {
      return NextResponse.json(
        { items: [], total: 0, limit, offset },
        { status: 200 }
      );
    }
    const safe = sanitizeFulltext(q);
    const ftQuery = `${safe} OR ${safe}~ OR ${safe}*`;

    const rows = await runQuery(
      `CALL db.index.fulltext.queryNodes("search_skill_label", $q) YIELD node, score
       WHERE score > 0.5
         AND ($skill_type IS NULL OR node.skillType = $skill_type)
       WITH node, score
       ORDER BY score DESC, node.preferredLabel_is
       SKIP $offset LIMIT $limit
       RETURN split(node.conceptUri, '/')[-1] AS uuid,
              node.conceptUri AS conceptUri,
              node.preferredLabel_is AS preferredLabel_is,
              node.skillType AS skillType,
              node.description_is AS description_is,
              score`,
      { q: ftQuery, skill_type: skillType, offset: neo4j.int(offset), limit: neo4j.int(limit) }
    );
    return NextResponse.json({
      items: rows,
      total: rows.length,
      limit,
      offset,
      note: "Full-text results are ranked by relevance; total equals the returned page size.",
    });
  }

  const countRows = await runQuery<{ total: number }>(
    `MATCH (s:Skill)
     WHERE ($skill_type IS NULL OR s.skillType = $skill_type)
     RETURN count(s) AS total`,
    { skill_type: skillType }
  );
  const total = countRows[0]?.total ?? 0;

  const items = await runQuery(
    `MATCH (s:Skill)
     WHERE ($skill_type IS NULL OR s.skillType = $skill_type)
     RETURN split(s.conceptUri, '/')[-1] AS uuid,
            s.conceptUri AS conceptUri,
            s.preferredLabel_is AS preferredLabel_is,
            s.skillType AS skillType,
            s.description_is AS description_is
     ORDER BY s.preferredLabel_is
     SKIP $offset LIMIT $limit`,
    { skill_type: skillType, offset: neo4j.int(offset), limit: neo4j.int(limit) }
  );

  return NextResponse.json({ items, total, limit, offset });
});
