import { NextRequest, NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import type { SearchResult, SearchResultType } from "@/lib/types";
import { withRouteHandler } from "@/lib/route";

function sanitizeFulltext(q: string): string {
  return q.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, "\\$&");
}

type Hit = SearchResult & { score: number };

function makeKey(type: SearchResultType, id: string): string {
  return `${type}:${id}`;
}

const MAX_QUERY_LENGTH = 200;

export const GET = withRouteHandler(async function (request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json(
      { query: q || "", results: [], total: 0 },
      { status: 200 }
    );
  }
  if (q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { detail: `Leitarstrengur má vera í mesta lagi ${MAX_QUERY_LENGTH} stafir.` },
      { status: 400 }
    );
  }

  const safe = sanitizeFulltext(q);
  const fuzzy = `${safe}~`;
  const wildcard = `${safe}*`;
  const ftQuery = `${safe} OR ${fuzzy} OR ${wildcard}`;

  const hits = new Map<string, Hit>();
  const addHit = (hit: Hit) => {
    const id =
      hit.result_type === "esco"
        ? `${hit.group_code ?? ""}|${hit.title}`
        : hit.code;
    const key = makeKey(hit.result_type, id);
    const existing = hits.get(key);
    if (!existing || hit.score > existing.score) hits.set(key, hit);
  };

  // 1. ÍSTARF21 exact code lookup
  if (/^\d{1,4}$/.test(q)) {
    const rows = await runQuery<{ code: string; title: string; level: number }>(
      `MATCH (g:OccupationGroup {code: $code})
       RETURN g.code AS code, g.title AS title, g.level AS level`,
      { code: q }
    );
    for (const r of rows) {
      addHit({
        result_type: "istarf",
        code: r.code,
        title: r.title,
        level: r.level,
        match_source: "code",
        score: 1000,
      });
    }
  }

  // 2. ÍSTARF21 full-text (categories)
  const istarf = await runQuery<{
    code: string;
    title: string;
    level: number;
    score: number;
  }>(
    `CALL db.index.fulltext.queryNodes("search_occupation_group_title", $q)
     YIELD node, score
     WHERE score > 0.5
     RETURN node.code AS code, node.title AS title, node.level AS level, score
     ORDER BY score DESC LIMIT 10`,
    { q: ftQuery }
  );
  for (const r of istarf) {
    addHit({
      result_type: "istarf",
      code: r.code,
      title: r.title,
      level: r.level,
      match_source: "istarf21",
      score: r.score,
    });
  }

  // 3. ESCO occupation labels as first-class role results
  const esco = await runQuery<{
    escoTitle: string;
    group_code: string;
    group_title: string;
    group_level: number;
    score: number;
  }>(
    `CALL db.index.fulltext.queryNodes("search_esco_occupation_label", $q)
     YIELD node, score
     WHERE score > 0.5
     MATCH (node)-[:BELONGS_TO_GROUP]->(g:OccupationGroup)
     RETURN node.preferredLabel_is AS escoTitle,
            g.code AS group_code,
            g.title AS group_title,
            g.level AS group_level,
            score
     ORDER BY score DESC LIMIT 15`,
    { q: ftQuery }
  );
  for (const r of esco) {
    addHit({
      result_type: "esco",
      code: r.group_code,
      title: r.escoTitle,
      level: r.group_level,
      match_source: "esco",
      group_code: r.group_code,
      group_title: r.group_title,
      score: r.score,
    });
  }

  // 4. Alias → resolve to ESCO occupation
  const alias = await runQuery<{
    escoTitle: string;
    group_code: string;
    group_title: string;
    group_level: number;
    score: number;
  }>(
    `CALL db.index.fulltext.queryNodes("search_alias_term_label", $q)
     YIELD node, score
     WHERE score > 0.5
     MATCH (node)-[:ALIAS_OF]->(occ:EscoOccupation)-[:BELONGS_TO_GROUP]->(g:OccupationGroup)
     RETURN occ.preferredLabel_is AS escoTitle,
            g.code AS group_code,
            g.title AS group_title,
            g.level AS group_level,
            score
     ORDER BY score DESC LIMIT 10`,
    { q: ftQuery }
  );
  for (const r of alias) {
    addHit({
      result_type: "esco",
      code: r.group_code,
      title: r.escoTitle,
      level: r.group_level,
      match_source: "alias",
      group_code: r.group_code,
      group_title: r.group_title,
      score: r.score,
    });
  }

  // ESCO roles first, then ÍSTARF categories. Within each, highest score first.
  const all = Array.from(hits.values()).sort((a, b) => {
    if (a.result_type !== b.result_type) {
      return a.result_type === "esco" ? -1 : 1;
    }
    return b.score - a.score;
  });

  const results: SearchResult[] = all.slice(0, 25).map(({ score: _score, ...rest }) => rest);

  return NextResponse.json({
    query: q,
    results,
    total: results.length,
  });
});
