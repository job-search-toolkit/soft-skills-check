import { NextRequest, NextResponse } from "next/server";
import { getSessionsKV } from "@/lib/kv";
import { validateWordId, generateProfileHash } from "@/lib/wordid";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ wordid: string }> }
) {
  try {
    const { wordid } = await params;

    if (!validateWordId(wordid)) {
      return NextResponse.json(
        { error: "Invalid word ID format" },
        { status: 400 }
      );
    }

    const kv = getSessionsKV();
    if (!kv) {
      return NextResponse.json(
        { error: "Storage unavailable" },
        { status: 503 }
      );
    }

    const raw = await kv.get(`user:${wordid}`);
    if (!raw) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(typeof raw === "string" ? JSON.parse(raw) : raw);
  } catch (error) {
    console.error("User read error:", error);
    return NextResponse.json(
      { error: "Failed to read user data" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ wordid: string }> }
) {
  try {
    const { wordid } = await params;

    if (!validateWordId(wordid)) {
      return NextResponse.json(
        { error: "Invalid word ID format" },
        { status: 400 }
      );
    }

    const kv = getSessionsKV();
    if (!kv) {
      return NextResponse.json(
        { error: "Storage unavailable" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const now = new Date().toISOString();

    // Read existing data
    const raw = await kv.get(`user:${wordid}`);
    const existing: any = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : {};

    // Append to history instead of overwriting
    if (body.analysisResult) {
      const history = existing.assessmentHistory || [];
      history.push({ date: now, result: body.analysisResult });
      existing.assessmentHistory = history;
      existing.analysisResult = body.analysisResult; // also keep latest
    }

    if (body.quizResults) {
      const history = existing.quizHistory || [];
      history.push({ date: now, results: body.quizResults });
      existing.quizHistory = history;
      existing.quizResults = body.quizResults; // also keep latest
    }

    // Generate profile hash if not exists
    if (!existing.profileHash) {
      const hash = await generateProfileHash(wordid);
      existing.profileHash = hash;
      // Store reverse mapping
      await kv.set(`profile:${hash}`, wordid, {
        ex: 365 * 24 * 60 * 60,
      });
    }

    // Merge other fields (context, name, email, etc.)
    const { analysisResult: _a, quizResults: _q, ...otherFields } = body;
    const updated = {
      ...existing,
      ...otherFields,
      lastActiveAt: now,
    };

    await kv.set(`user:${wordid}`, JSON.stringify(updated), {
      ex: 365 * 24 * 60 * 60,
    });
    return NextResponse.json({ ok: true, profileHash: updated.profileHash });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}
