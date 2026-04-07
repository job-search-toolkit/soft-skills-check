import { NextRequest, NextResponse } from "next/server";
import { getSessionsKV } from "@/lib/kv";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const kv = getSessionsKV();

    if (!kv) {
      return NextResponse.json(
        { error: "Storage unavailable" },
        { status: 503 }
      );
    }

    const raw = await kv.get(`invite:${token}`);
    if (!raw) {
      return NextResponse.json(
        { error: "Invite not found" },
        { status: 404 }
      );
    }

    const invite: any = typeof raw === "string" ? JSON.parse(raw) : raw;

    // Mark as used on first access
    if (!invite.usedAt) {
      invite.usedAt = new Date().toISOString();
      await kv.set(`invite:${token}`, JSON.stringify(invite), {
        ex: 90 * 24 * 60 * 60,
      });
    }

    return NextResponse.json({
      name: invite.name,
      email: invite.email,
      resume: invite.resume,
      jobDescription: invite.jobDescription,
      professions: invite.professions,
      referrerName: invite.referrerName,
      wordId: invite.wordId,
      lang: invite.lang,
    });
  } catch (error) {
    console.error("Invite read error:", error);
    return NextResponse.json(
      { error: "Failed to read invite" },
      { status: 500 }
    );
  }
}
