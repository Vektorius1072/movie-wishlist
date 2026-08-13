import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

const hasUpstashConfig =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstashConfig ? Redis.fromEnv() : null;

const limiters = redis
  ? {
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "60 s"),
        prefix: "ratelimit:auth",
      }),
      search: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "60 s"),
        prefix: "ratelimit:search",
      }),
      inviteGuess: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "60 s"),
        prefix: "ratelimit:invite",
      }),
    }
  : null;

let warnedOnce = false;

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}

export type RateLimitKind = "auth" | "search" | "inviteGuess";

export async function checkRateLimit(req: NextRequest, kind: RateLimitKind) {
  if (!limiters) {
    if (!warnedOnce) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN не заданы — rate limiting отключён. " +
          "Это нормально для локальной разработки, но перед публичным запуском обязательно настройте Upstash."
      );
      warnedOnce = true;
    }
    return { allowed: true as const };
  }

  const ip = getClientIp(req);
  const { success } = await limiters[kind].limit(ip);
  return { allowed: success };
}
