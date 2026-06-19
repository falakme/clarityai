import { NextResponse } from "next/server";

/**
 * Same-origin proxy for the follow-up chat. Forwards the document context +
 * conversation to the backend's /api/chat and returns the assistant's answer.
 * Stateless: the client sends the full context and history each turn.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BACKEND = (process.env.BACKEND_INTERNAL_URL || "http://backend:8000").replace(/\/$/, "");

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    console.error("[JSON Parsing Error]:", error);
    return NextResponse.json({ detail: "Invalid JSON." }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[Backend Connection Error]:", error);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
