"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, Suspense } from "react";
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("No email address found. Please sign up again.");
      return;
    }
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Could not resend email.");
      } else {
        setResent(true);
        toast.success("Verification email sent!");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

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
              Check your inbox
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We sent a verification link to{" "}
              {email ? (
                <span className="font-medium text-foreground">{email}</span>
              ) : (
                "your email address"
              )}
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

          {/* Resend */}
          {!resent ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder or resend below.
              </p>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={handleResend}
                disabled={resending || !email}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${resending ? "animate-spin" : ""}`}
                />
                {resending ? "Sending..." : "Resend verification email"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 py-3 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              Email resent successfully!
            </div>
          )}

          {/* Back link */}
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          The link expires in 24 hours.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
