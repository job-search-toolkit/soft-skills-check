import { NextRequest, NextResponse } from "next/server";
import { getSessionsKV } from "@/lib/kv";

// GET: single offer (with email for "Contact" action)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kv = getSessionsKV();
    if (!kv) {
      return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
    }

    const raw = await kv.get(`exchange:${id}`);
    if (!raw) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const offer: any = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!offer.active) {
      return NextResponse.json({ error: "Offer no longer active" }, { status: 404 });
    }

    return NextResponse.json(offer);
  } catch (error) {
    console.error("Exchange get error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// DELETE: remove own offer (auth by profileHash match)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const profileHash = searchParams.get("profileHash");

    if (!profileHash) {
      return NextResponse.json({ error: "profileHash required" }, { status: 400 });
    }

    const kv = getSessionsKV();
    if (!kv) {
      return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
    }

    const raw = await kv.get(`exchange:${id}`);
    if (!raw) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Upstash redis returns parsed JSON directly
    const offer: any = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (offer.profileHash !== profileHash) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Mark inactive
    offer.active = false;
    await kv.set(`exchange:${id}`, JSON.stringify(offer), {
      ex: 90 * 24 * 60 * 60,
    });

    // Remove from index
    const index: string[] = await kv.get("exchange_index") || [];
    const updated = index.filter((i) => i !== id);
    await kv.set("exchange_index", JSON.stringify(updated));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Exchange delete error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
