import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { withRouteHandler } from "@/lib/route";

export const GET = withRouteHandler(async function () {
  try {
    await runQuery("RETURN 1 AS ok");
    return NextResponse.json({ status: "ok", neo4j: "connected" });
  } catch {
    return NextResponse.json(
      { status: "error", neo4j: "disconnected" },
      { status: 503 }
    );
  }
});
