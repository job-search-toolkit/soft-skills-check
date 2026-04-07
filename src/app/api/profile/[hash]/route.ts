import { NextRequest, NextResponse } from "next/server";
import { getSessionsKV } from "@/lib/kv";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;

    if (!hash || hash.length < 8) {
      return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
    }

    const kv = getSessionsKV();
    if (!kv) {
      return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
    }

    // Reverse lookup: hash → wordId
    const wordId: string | null = await kv.get(`profile:${hash}`);
    if (!wordId) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get user data
    const raw = await kv.get(`user:${wordId}`);
    if (!raw) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const data: any = typeof raw === "string" ? JSON.parse(raw) : raw;

    // Return public data only (no email, no wordId, no invite details)
    return NextResponse.json({
      name: data.name || null,
      profileHash: data.profileHash,
      assessmentHistory: data.assessmentHistory || (data.analysisResult ? [{ date: data.lastActiveAt, result: data.analysisResult }] : []),
      quizHistory: data.quizHistory || (data.quizResults ? [{ date: data.lastActiveAt, results: data.quizResults }] : []),
      createdAt: data.createdAt,
      lastActiveAt: data.lastActiveAt,
    });
  } catch (error) {
    console.error("Profile read error:", error);
    return NextResponse.json({ error: "Failed to read profile" }, { status: 500 });
  }
}
