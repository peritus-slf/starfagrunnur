/**
 * Route-handler tests. Each test imports a route module and invokes it with a
 * constructed NextRequest; Neo4j is mocked so no live DB is needed.
 *
 * Scope: validate the contract at the route boundary (status codes, error
 * shapes, parameter handling). Deep Cypher/graph correctness is out of scope
 * for these tests — that's a separate integration suite.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the shared Neo4j helper before any route imports resolve it.
vi.mock("@/lib/neo4j", () => ({
  runQuery: vi.fn(),
}));

import { runQuery } from "@/lib/neo4j";

function makeRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://test.local"));
}

beforeEach(() => {
  vi.mocked(runQuery).mockReset();
});

describe("withRouteHandler", () => {
  it("returns a JSON 500 when the handler throws", async () => {
    const { withRouteHandler } = await import("@/lib/route");
    const throwing = withRouteHandler(async () => {
      throw new Error("boom");
    });
    const res = await throwing(makeRequest("/"), {});
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.detail).toBeTruthy();
  });
});

describe("/api/v1/search", () => {
  it("short query returns empty results with 200 (no DB call)", async () => {
    const { GET } = await import("@/app/api/v1/search/route");
    const res = await GET(makeRequest("/api/v1/search?q=a"), {});
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results).toEqual([]);
    expect(runQuery).not.toHaveBeenCalled();
  });

  it("oversized query returns 400", async () => {
    const { GET } = await import("@/app/api/v1/search/route");
    const longQ = "a".repeat(300);
    const res = await GET(makeRequest(`/api/v1/search?q=${longQ}`), {});
    expect(res.status).toBe(400);
    expect(runQuery).not.toHaveBeenCalled();
  });
});

describe("/api/v1/occupations/[code]", () => {
  it("rejects non-numeric codes with 400", async () => {
    const { GET } = await import("@/app/api/v1/occupations/[code]/route");
    const res = await GET(makeRequest("/api/v1/occupations/abc"), {
      params: Promise.resolve({ code: "abc" }),
    });
    expect(res.status).toBe(400);
    expect(runQuery).not.toHaveBeenCalled();
  });

  it("returns 404 when the code does not exist", async () => {
    vi.mocked(runQuery).mockResolvedValueOnce([]);
    const { GET } = await import("@/app/api/v1/occupations/[code]/route");
    const res = await GET(makeRequest("/api/v1/occupations/9999"), {
      params: Promise.resolve({ code: "9999" }),
    });
    expect(res.status).toBe(404);
  });
});

describe("/api/v1/esco-occupations/[uuid]", () => {
  it("rejects malformed UUIDs with 400", async () => {
    const { GET } = await import("@/app/api/v1/esco-occupations/[uuid]/route");
    const res = await GET(makeRequest("/api/v1/esco-occupations/not-a-uuid"), {
      params: Promise.resolve({ uuid: "not-a-uuid" }),
    });
    expect(res.status).toBe(400);
    expect(runQuery).not.toHaveBeenCalled();
  });
});

describe("/api/v1/skills/[uuid]/occupations", () => {
  it("accepts a valid UUID and calls Neo4j", async () => {
    vi.mocked(runQuery)
      .mockResolvedValueOnce([{ total: 1 }]) // count
      .mockResolvedValueOnce([
        {
          uuid: "8d3e8aaa-791b-4c75-a465-f3f827028f50",
          conceptUri: "http://data.europa.eu/esco/occupation/8d3e8aaa-791b-4c75-a465-f3f827028f50",
          preferredLabel_is: "hjúkrunarfræðingur",
          iscoGroup: "2221",
          relationType: "essential",
          group_code: "2221",
          group_title: "Sérfræðistörf við hjúkrun",
        },
      ]); // items
    const { GET } = await import(
      "@/app/api/v1/skills/[uuid]/occupations/route"
    );
    const uuid = "ccd0a1d9-afda-43d9-b901-96344886e14d";
    const res = await GET(
      makeRequest(`/api/v1/skills/${uuid}/occupations`),
      { params: Promise.resolve({ uuid }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(1);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].relationType).toBe("essential");
  });

  it("rejects invalid relation_type with 400", async () => {
    const { GET } = await import(
      "@/app/api/v1/skills/[uuid]/occupations/route"
    );
    const uuid = "ccd0a1d9-afda-43d9-b901-96344886e14d";
    const res = await GET(
      makeRequest(
        `/api/v1/skills/${uuid}/occupations?relation_type=bogus`
      ),
      { params: Promise.resolve({ uuid }) }
    );
    expect(res.status).toBe(400);
    expect(runQuery).not.toHaveBeenCalled();
  });
});

describe("/api/v1/stats (via getStats)", () => {
  it("returns the fallback shape when Neo4j is unreachable", async () => {
    vi.mocked(runQuery).mockRejectedValue(new Error("ECONNREFUSED"));
    // getStats catches the rejection internally and returns FALLBACK
    const { getStats } = await import("@/lib/stats");
    const stats = await getStats();
    expect(stats.occupation_groups.total).toBeGreaterThan(0);
    expect(stats.skills.total).toBeGreaterThan(0);
    // Fallback marker: epoch timestamp
    expect(stats.generated_at).toBe("1970-01-01T00:00:00.000Z");
  });
});
