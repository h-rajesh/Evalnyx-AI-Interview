import { NextRequest } from "next/server";

/**
 * Extracts the client IP from a NextRequest.
 * Reads `x-forwarded-for` (set by Vercel / reverse proxies) and falls back
 * to a stable localhost key so rate limiting works in local development.
 */
export function getIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  return ip;
}
