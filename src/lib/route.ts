import { NextRequest, NextResponse } from "next/server";

/**
 * Wrap a Next.js route handler so unhandled errors return a consistent JSON 500
 * instead of the framework's default HTML stack trace. The underlying error is
 * logged server-side with the request path for diagnostics.
 */
export function withRouteHandler<Ctx>(
  handler: (req: NextRequest, ctx: Ctx) => Promise<Response> | Response
) {
  return async (req: NextRequest, ctx: Ctx): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      const path = new URL(req.url).pathname;
      console.error(`[api] ${req.method} ${path} failed:`, err);
      return NextResponse.json(
        {
          detail:
            "Innri villa í þjónustunni. Reyndu aftur síðar eða hafðu samband við info@peritus.is ef vandamálið heldur áfram.",
        },
        { status: 500 }
      );
    }
  };
}
