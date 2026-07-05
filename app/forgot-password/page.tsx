"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, ArrowLeft, MailCheck } from "lucide-react";

import { AuthShell } from "@/components/features/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Something went wrong.");
        return;
      }

      setSent(true);
      reset();

      toast.success(data.message);
    } catch (error) {
      console.error(error);
      toast.error("Unable to send reset email. Please try again.");
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email address and we'll send you a password reset link."
      footer={
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border/60 bg-muted/30 p-6 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <MailCheck className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-semibold">
            Check your inbox
          </h3>

          <p className="text-sm text-muted-foreground">
            If an account exists for that email, we've sent a password reset
            link.
          </p>

          <p className="text-xs text-muted-foreground">
            Please check your inbox and spam folder.
          </p>

          <Button
            variant="outline"
            className="mt-2 rounded-xl"
            onClick={() => setSent(false)}
          >
            Send another email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="rounded-xl pl-9"
                {...register("email")}
              />
            </div>

            {errors.email && (
              <p className="text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl gradient-primary text-primary-foreground"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}