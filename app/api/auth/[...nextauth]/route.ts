import { handlers } from "@/lib/auth";
import type { NextRequest } from "next/server";

const GET = async (req: NextRequest) => {
  try {
    const response = await handlers.GET(req);
    const cloned = response.clone();
    const text = await cloned.text();
    console.log("[AUTH] GET /api/auth/* response:", response.status, text.slice(0, 500));
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
