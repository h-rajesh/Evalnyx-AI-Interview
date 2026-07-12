"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Lock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { AuthShell } from "@/components/features/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [checking, setChecking] = useState(true);
  const [validToken, setValidToken] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setValidToken(false);
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/auth/validate-reset-token?token=${token}`
        );

        const data = await res.json();

        setValidToken(data.valid);
      } catch {
        setValidToken(false);
      }

      setChecking(false);
    }

    validateToken();
  }, [token]);

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Password updated successfully.");

      router.push("/auth/signin?reset=success");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  if (checking) {
    return (
      <AuthShell
        title="Validating"
        subtitle="Please wait while we verify your reset link."
      >
        <div className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Validating reset link...
          </p>
        </div>
      </AuthShell>
    );
  }

  if (!validToken) {
    return (
      <AuthShell
        title="Invalid Reset Link"
        subtitle="This password reset link is invalid or has expired."
      >
        <div className="flex flex-col items-center gap-4 py-6">
          <AlertTriangle className="h-12 w-12 text-destructive" />

          <p className="text-center text-sm text-muted-foreground">
            Password reset links expire after one hour or after they are used.
          </p>

          <Button asChild className="rounded-xl">
            <Link href="/auth/forgot-password">
              Request a New Link
            </Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a New Password"
      subtitle="Choose a strong password for your account."
      footer={
        <Link
          href="/auth/signin"
          className="font-semibold text-primary hover:underline"
        >
          Back to Sign In
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Your reset link has been verified.
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            New Password
          </Label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="rounded-xl pl-9"
              {...register("password")}
            />
          </div>

          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">
            Confirm Password
          </Label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              className="rounded-xl pl-9"
              {...register("confirm")}
            />
          </div>

          {errors.confirm && (
            <p className="text-xs text-destructive">
              {errors.confirm.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl gradient-primary text-primary-foreground"
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Validating"
          subtitle="Please wait while we verify your reset link."
        >
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Validating reset link...
            </p>
          </div>
        </AuthShell>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}