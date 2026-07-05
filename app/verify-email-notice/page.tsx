"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Mail, RefreshCw, CheckCircle2, LogOut } from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

export default function VerifyEmailNoticePage() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  async function resendEmail() {
    setLoading(true);
    setError("");

    try {
      // Use the authenticated route — rate limited by user ID
      const res = await fetch("/api/resend-verification", {
        method: "POST",
      });

      const data = await res.json();

      if (res.status === 429) {
        const mins = Math.ceil((data.retryAfter ?? 3600) / 60);
        setRetryAfter(data.retryAfter ?? null);
        setError(`Too many attempts. Please try again in ${mins} minute${mins !== 1 ? "s" : ""}.`);
      } else if (!res.ok) {
        setError(data.message ?? "Something went wrong.");
      } else {
        setResent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card shadow-elevated p-8 space-y-6 text-center">
          {/* Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Verify your email
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hi <span className="font-medium text-foreground">{session?.user?.name}</span>,
              we sent a verification link to{" "}
              <span className="font-medium text-foreground">
                {session?.user?.email}
              </span>
              . Click the link to activate your account.
            </p>
          </div>

          {/* Steps */}
          <div className="rounded-xl bg-muted/50 p-4 space-y-3 text-left">
            {[
              "Open your email inbox",
              "Find the email from Evalynx",
              "Click the verification link",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-primary text-[11px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>

          {/* Resend / success */}
          {!resent ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder or resend below.
              </p>

              {error && (
                <p className="text-xs text-destructive font-medium">{error}</p>
              )}

              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={resendEmail}
                disabled={loading || !!retryAfter}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Sending…" : "Resend verification email"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 py-3 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              Email resent successfully!
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out and use a different account
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          The link expires in 24 hours.
        </p>
      </div>
    </div>
  );
}