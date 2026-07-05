import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Email resend rate limiter.
 * Allows 3 resend requests per user per hour.
 * Key: user ID (authenticated) or email (unauthenticated).
 */
export const resendLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "ratelimit:resend",
  analytics: true,
});

/**
 * Forgot-password rate limiter.
 * Allows 5 requests per IP per hour.
 * Prevents email flooding / user enumeration timing attacks.
 */
export const forgotPasswordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "ratelimit:forgot-password",
  analytics: true,
});

/**
 * Login rate limiter.
 * Allows 10 attempts per IP per 15 minutes.
 * Key: client IP address.
 */
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "ratelimit:login",
  analytics: true,
});

/**
 * General API rate limiter.
 * Allows 60 requests per IP per minute.
 * Use this on any public-facing API route.
 */
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "ratelimit:api",
  analytics: true,
});
