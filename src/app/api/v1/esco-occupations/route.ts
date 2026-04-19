import { NextRequest, NextResponse } from "next/server";
import neo4j from "neo4j-driver";
import { runQuery } from "@/lib/neo4j";
import { withRouteHandler } from "@/lib/route";

const MAX_LIMIT = 200;
const MAX_OFFSET = 10_000; // ~3k ESCO occupations; headroom without being unbounded
const MAX_QUERY_LENGTH = 200;

function sanitizeFulltext(q: string): string {
  return q.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, "\\$&");
}

export const GET = withRouteHandler(async function (request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const q = sp.get("q")?.trim() || null;
  const iscoGroup = sp.get("isco_group") || null;
  const inIstarf21 = sp.get("in_istarf21") || null;

  if (iscoGroup && !/^\d{1,4}$/.test(iscoGroup)) {
    return NextResponse.json({ detail: "Ógildur isco_group" }, { status: 400 });
  }
  if (inIstarf21 && !/^\d{1,4}$/.test(inIstarf21)) {
    return NextResponse.json({ detail: "Ógildur in_istarf21" }, { status: 400 });
  }

  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(sp.get("limit") || "50", 10) || 50)
  );
  const offset = Math.min(
    MAX_OFFSET,
    Math.max(0, parseInt(sp.get("offset") || "0", 10) || 0)
  );

  if (q && q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { detail: `Leitarstrengur má vera í mesta lagi ${MAX_QUERY_LENGTH} stafir.` },
      { status: 400 }
    );
  }

  // Full-text path: ranked results via search_esco_occupation_label.
  if (q) {
    if (q.length < 2) {
      return NextResponse.json({ items: [], total: 0, limit, offset });
    }
    const safe = sanitizeFulltext(q);
    const ftQuery = `${safe} OR ${safe}~ OR ${safe}*`;

    const rows = await runQuery(
      `CALL db.index.fulltext.queryNodes("search_esco_occupation_label", $q) YIELD node, score
       WHERE score > 0.5
         AND ($isco_group IS NULL OR node.iscoGroup = $isco_group)
       OPTIONAL MATCH (node)-[:BELONGS_TO_GROUP]->(g:OccupationGroup)
       WITH node, score, g
       WHERE $in_istarf21 IS NULL
             OR g.code = $in_istarf21
             OR (g)-[:CHILD_OF*1..3]->(:OccupationGroup {code: $in_istarf21})
       WITH node, g, score
       ORDER BY score DESC, node.preferredLabel_is
       SKIP $offset LIMIT $limit
       RETURN split(node.conceptUri, '/')[-1] AS uuid,
              node.conceptUri AS conceptUri,
              node.preferredLabel_is AS preferredLabel_is,
              node.description_is AS description_is,
              node.iscoGroup AS iscoGroup,
              g.code AS group_code,
              g.title AS group_title`,
      {
        q: ftQuery,
        isco_group: iscoGroup,
        in_istarf21: inIstarf21,
        offset: neo4j.int(offset),
        limit: neo4j.int(limit),
      }
    );
    return NextResponse.json({
      items: rows,
      total: rows.length,
      limit,
      offset,
      note: "Full-text results are ranked by relevance; total equals the returned page size.",
    });
  }

  // No full-text query: paginated listing with optional filters.
  const filterClauses: string[] = [];
  if (iscoGroup) filterClauses.push("occ.iscoGroup = $isco_group");
  if (inIstarf21) {
    filterClauses.push(
      "(g.code = $in_istarf21 OR (g)-[:CHILD_OF*1..3]->(:OccupationGroup {code: $in_istarf21}))"
    );
  }
  const where = filterClauses.length ? "WHERE " + filterClauses.join(" AND ") : "";

  // WHERE must go before OPTIONAL MATCH; otherwise it filters the optional
  // pattern, not the row set, and rows that don't match still come through.
  const cypherCount = inIstarf21
    ? `MATCH (occ:EscoOccupation)-[:BELONGS_TO_GROUP]->(g:OccupationGroup)
       ${where}
       RETURN count(occ) AS total`
    : `MATCH (occ:EscoOccupation)
       ${where}
       RETURN count(occ) AS total`;

  const cypherItems = inIstarf21
    ? `MATCH (occ:EscoOccupation)-[:BELONGS_TO_GROUP]->(g:OccupationGroup)
       ${where}
       RETURN split(occ.conceptUri, '/')[-1] AS uuid,
              occ.conceptUri AS conceptUri,
              occ.preferredLabel_is AS preferredLabel_is,
              occ.description_is AS description_is,
              occ.iscoGroup AS iscoGroup,
              g.code AS group_code,
              g.title AS group_title
       ORDER BY occ.preferredLabel_is
       SKIP $offset LIMIT $limit`
    : `MATCH (occ:EscoOccupation)
       ${where}
       OPTIONAL MATCH (occ)-[:BELONGS_TO_GROUP]->(g:OccupationGroup)
       RETURN split(occ.conceptUri, '/')[-1] AS uuid,
              occ.conceptUri AS conceptUri,
              occ.preferredLabel_is AS preferredLabel_is,
              occ.description_is AS description_is,
              occ.iscoGroup AS iscoGroup,
              g.code AS group_code,
              g.title AS group_title
       ORDER BY occ.preferredLabel_is
       SKIP $offset LIMIT $limit`;

  const params = {
    isco_group: iscoGroup,
    in_istarf21: inIstarf21,
    offset: neo4j.int(offset),
    limit: neo4j.int(limit),
  };

  const countRows = await runQuery<{ total: number }>(cypherCount, params);
  const total = countRows[0]?.total ?? 0;
  const items = await runQuery(cypherItems, params);

  return NextResponse.json({ items, total, limit, offset });
});
