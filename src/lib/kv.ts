import { Redis } from "@upstash/redis";

/**
 * SESSIONS KV helper — for invites and user data
 */

export function getSessionsKV(): Redis | null {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return null;
    }
    // Prefix all session keys with "session:" to separate from analytics
    return Redis.fromEnv();
  } catch {
    return null;
  }
}
