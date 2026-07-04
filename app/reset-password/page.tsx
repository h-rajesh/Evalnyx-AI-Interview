"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Lock } from "lucide-react";

import { AuthShell } from "@/components/features/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z.string().min(6, "At least 6 characters"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    console.log(data);

    await new Promise((resolve) => setTimeout(resolve, 600));

    toast.success("Password updated successfully!");

    router.push("/auth/signin");
  };

  return (
    <AuthShell
      title="Set a new password"
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
        {/* Password */}
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

        {/* Confirm Password */}
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