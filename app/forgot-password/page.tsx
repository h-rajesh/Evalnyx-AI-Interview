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
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_values: FormValues) => {
    // TODO: Replace with your API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    setSent(true);
    toast.success("Reset link sent");
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="We'll email you a link to reset your password."
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-6 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <MailCheck className="h-6 w-6" />
          </div>

          <p className="text-sm font-medium">Check your inbox</p>

          <p className="text-sm text-muted-foreground">
            We sent a password reset link to your email.
          </p>

          <Button asChild variant="outline" className="mt-2 rounded-xl">
            <Link href="/reset-password">
              Continue to reset
            </Link>
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