import { NextResponse } from "next/server";
import { withRouteHandler } from "@/lib/route";
import { getStats } from "@/lib/stats";

export const revalidate = 300; // cache for 5 minutes

export const GET = withRouteHandler(async function () {
  const stats = await getStats();
  return NextResponse.json(stats);
});
