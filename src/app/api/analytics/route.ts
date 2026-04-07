import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

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

function getRedis(): Redis | null {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return null;
    }
    return Redis.fromEnv();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const redis = getRedis();
    if (!redis) {
      // Gracefully degrade — analytics not available (e.g. local dev)
      return NextResponse.json({ ok: true });
    }

    const body = await request.json();

    // Handle question/quiz ratings
    if (body.type === "question_ratings" || body.type === "quiz_ratings") {
      const ratingsKey = body.type === "question_ratings" ? "q_ratings" : "quiz_ratings";
      const allRatings: Record<string, Record<string, number>> = await redis.get(ratingsKey) || {};
      for (const [qId, rating] of Object.entries(body.ratings as Record<string, string>)) {
        if (!allRatings[qId]) allRatings[qId] = {};
        allRatings[qId][rating] = (allRatings[qId][rating] || 0) + 1;
      }
      await redis.set(ratingsKey, allRatings);
      return NextResponse.json({ ok: true });
    }

    // Handle score analytics
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
    const stats: AnalyticsStats = await redis.get("stats") || { ...EMPTY_STATS };

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
    await redis.set("stats", stats);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics POST error:", error);
    return NextResponse.json({ ok: true }); // Don't fail the user flow
  }
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: "Analytics not available" }, { status: 503 });
    }

    const stats: AnalyticsStats = await redis.get("stats") || { ...EMPTY_STATS };

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
