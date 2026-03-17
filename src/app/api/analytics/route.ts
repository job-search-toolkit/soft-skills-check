import { NextResponse } from "next/server";

interface DimensionTotal {
  sum: number;
  count: number;
}

interface AnalyticsStats {
  totalCompleted: number;
  dimensionTotals: Record<string, DimensionTotal>;
  overallTotal: { sum: number; count: number };
}

const EMPTY_STATS: AnalyticsStats = {
  totalCompleted: 0,
  dimensionTotals: {},
  overallTotal: { sum: 0, count: 0 },
};

interface KVStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

async function getKV(): Promise<KVStore | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const kv = (env as Record<string, unknown>).ANALYTICS as KVStore | undefined;
    return kv ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const kv = await getKV();
    if (!kv) {
      // Gracefully degrade — analytics not available (e.g. local dev)
      return NextResponse.json({ ok: true });
    }

    const body = (await request.json()) as {
      dimensionScores: { dimension: string; score: number }[];
      overallScore: number;
    };

    if (
      !body.dimensionScores ||
      !Array.isArray(body.dimensionScores) ||
      typeof body.overallScore !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Read existing stats
    const raw = await kv.get("stats");
    const stats: AnalyticsStats = raw ? JSON.parse(raw) : { ...EMPTY_STATS };

    // Increment totals
    stats.totalCompleted += 1;
    stats.overallTotal.sum += body.overallScore;
    stats.overallTotal.count += 1;

    for (const dim of body.dimensionScores) {
      if (!stats.dimensionTotals[dim.dimension]) {
        stats.dimensionTotals[dim.dimension] = { sum: 0, count: 0 };
      }
      stats.dimensionTotals[dim.dimension].sum += dim.score;
      stats.dimensionTotals[dim.dimension].count += 1;
    }

    // Write back
    await kv.put("stats", JSON.stringify(stats));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics POST error:", error);
    return NextResponse.json({ ok: true }); // Don't fail the user flow
  }
}

export async function GET() {
  try {
    const kv = await getKV();
    if (!kv) {
      return NextResponse.json({ error: "Analytics not available" }, { status: 503 });
    }

    const raw = await kv.get("stats");
    const stats: AnalyticsStats = raw ? JSON.parse(raw) : { ...EMPTY_STATS };

    // Calculate averages
    const averages: Record<string, number> = {};
    for (const [dimension, total] of Object.entries(stats.dimensionTotals)) {
      if (total.count > 0) {
        averages[dimension] = Math.round((total.sum / total.count) * 10) / 10;
      }
    }

    const overallAverage =
      stats.overallTotal.count > 0
        ? Math.round(
            (stats.overallTotal.sum / stats.overallTotal.count) * 10
          ) / 10
        : 0;

    return NextResponse.json({
      totalCompleted: stats.totalCompleted,
      averages,
      overallAverage,
    });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json({ error: "Analytics error" }, { status: 500 });
  }
}
