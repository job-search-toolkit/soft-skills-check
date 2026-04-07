import { NextRequest, NextResponse } from "next/server";
import { getSessionsKV } from "@/lib/kv";
import { validateWordId, generateProfileHash } from "@/lib/wordid";

interface ExchangeOffer {
  id: string;
  profileHash: string;
  strongTopics: string[];
  wantTopics: string[];
  format: "text" | "video" | "any";
  lang: string;
  message: string;
  contactEmail: string;
  createdAt: string;
  active: boolean;
}

function generateId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 8);
}

// GET: list all active offers
export async function GET() {
  try {
    const kv = getSessionsKV();
    if (!kv) {
      return NextResponse.json({ offers: [], total: 0 });
    }

    const index: string[] = await kv.get("exchange_index") || [];

    const offers: Omit<ExchangeOffer, "contactEmail">[] = [];
    for (const id of index) {
      const raw = await kv.get(`exchange:${id}`);
      if (raw) {
        const offer = JSON.parse(raw) as ExchangeOffer;
        if (offer.active) {
          // Don't expose email in listing
          const { contactEmail: _, ...publicOffer } = offer;
          offers.push(publicOffer);
        }
      }
    }

    return NextResponse.json({ offers, total: offers.length });
  } catch (error) {
    console.error("Exchange list error:", error);
    return NextResponse.json({ offers: [], total: 0 });
  }
}

// POST: create new offer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wordId, strongTopics, wantTopics, format, message, contactEmail, lang } = body;

    if (!wordId || !validateWordId(wordId)) {
      return NextResponse.json({ error: "Invalid word ID" }, { status: 400 });
    }
    if (!strongTopics?.length || !wantTopics?.length) {
      return NextResponse.json({ error: "Topics required" }, { status: 400 });
    }
    if (!contactEmail || !contactEmail.includes("@")) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const kv = getSessionsKV();
    if (!kv) {
      return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
    }

    const profileHash = await generateProfileHash(wordId);
    const id = generateId();

    const offer: ExchangeOffer = {
      id,
      profileHash,
      strongTopics,
      wantTopics,
      format: format || "any",
      lang: lang || "en",
      message: (message || "").slice(0, 500),
      contactEmail,
      createdAt: new Date().toISOString(),
      active: true,
    };

    // Save offer
    await kv.set(`exchange:${id}`, JSON.stringify(offer), {
      ex: 90 * 24 * 60 * 60,
    });

    // Save reverse mapping: wordId → exchange ID (so user can find their own offer)
    await kv.set(`exchange_user:${profileHash}`, id, {
      ex: 90 * 24 * 60 * 60,
    });

    // Update index
    const index: string[] = await kv.get("exchange_index") || [];
    index.push(id);
    await kv.set("exchange_index", JSON.stringify(index));

    // Also ensure profile hash mapping exists
    const existingMapping = await kv.get(`profile:${profileHash}`);
    if (!existingMapping) {
      await kv.set(`profile:${profileHash}`, wordId, {
        ex: 365 * 24 * 60 * 60,
      });
    }

    return NextResponse.json({ id, ok: true });
  } catch (error) {
    console.error("Exchange create error:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
