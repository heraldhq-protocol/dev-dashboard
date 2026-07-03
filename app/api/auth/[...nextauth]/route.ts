import { handlers } from "@/lib/auth";
import type { NextRequest } from "next/server";

const DEBUG_AUTH = process.env.NODE_ENV !== "production";

const GET = async (req: NextRequest) => {
  try {
    const response = await handlers.GET(req);
    if (DEBUG_AUTH) {
      // Reading the body buffers the whole response; only do this in dev.
      const text = await response.clone().text();
      console.log("[AUTH] GET /api/auth/* response:", response.status, text.slice(0, 500));
    }
    return response;
  } catch (err) {
    console.error("[AUTH] GET /api/auth/* handler error:", err);
    return new Response(JSON.stringify({ error: "Auth handler error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

const POST = async (req: NextRequest) => {
  try {
    return await handlers.POST(req);
  } catch (err) {
    console.error("[AUTH] POST /api/auth/* handler error:", err);
    return new Response(JSON.stringify({ error: "Auth handler error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export { GET, POST };
