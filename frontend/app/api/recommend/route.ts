import { NextResponse } from "next/server";

/**
 * Same-origin proxy for the agentic "Verified Local Support" recommendation.
 * Kept separate from /api/translate-form so the (slower) Brave + AI-evaluation
 * step doesn't block the main translation and risk a gateway timeout.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BACKEND = process.env.BACKEND_INTERNAL_URL ?? "http://backend:8000";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON." }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND}/api/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    // Recommendations are best-effort: return empty fields, never a hard error.
    return NextResponse.json(
      {
        recommended_resource_name: "",
        recommended_resource_url: "",
        ai_reasoning_for_recommendation: "",
      },
      { status: 200 },
    );
  }
}
