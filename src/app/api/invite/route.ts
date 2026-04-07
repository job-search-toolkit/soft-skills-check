import { NextRequest, NextResponse } from "next/server";
import { getSessionsKV } from "@/lib/kv";
import { generateWordId, generateInviteToken } from "@/lib/wordid";

interface InviteRequest {
  name: string;
  email: string;
  resume?: string;
  jobDescription?: string;
  professions?: string[];
  referrerName?: string;
  lang?: "ru" | "en";
}

export async function POST(request: NextRequest) {
  try {
    const body: InviteRequest = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 }
      );
    }

    const wordId = generateWordId();
    const token = generateInviteToken();

    const invite = {
      name: body.name,
      email: body.email,
      resume: body.resume || undefined,
      jobDescription: body.jobDescription || undefined,
      professions: body.professions || undefined,
      referrerName: body.referrerName || undefined,
      wordId,
      lang: body.lang || "ru",
      createdAt: new Date().toISOString(),
      usedAt: null as string | null,
    };

    const kv = getSessionsKV();
    if (kv) {
      // 90-day TTL
      await kv.set(`invite:${token}`, JSON.stringify(invite), {
        ex: 90 * 24 * 60 * 60,
      });
      // Also create user entry
      await kv.set(
        `user:${wordId}`,
        JSON.stringify({
          name: body.name,
          email: body.email,
          inviteToken: token,
          createdAt: invite.createdAt,
          lastActiveAt: invite.createdAt,
        }),
        { ex: 365 * 24 * 60 * 60 }
      );
    }

    const host = request.headers.get("host") || "soft-skills.transformerinstitute.org";
    const protocol = host.includes("localhost") ? "http" : "https";
    const url = `${protocol}://${host}/i/${token}`;

    return NextResponse.json({ wordId, token, url });
  } catch (error) {
    console.error("Invite creation error:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
