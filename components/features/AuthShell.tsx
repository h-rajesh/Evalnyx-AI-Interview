"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Logo } from "@/components/common/Logo";

const highlights = [
  "AI-generated questions tailored to your role",
  "Real-time feedback on tone, posture & clarity",
  "Detailed reports with a personal learning roadmap",
];

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden gradient-primary p-10 text-primary-foreground lg:flex">
        <Link href="/">
          <Logo className="[&_span]:text-primary-foreground" />
        </Link>

        <div className="relative z-10 space-y-6">
          <h2 className="font-display text-3xl font-bold leading-tight">
            Practice interviews with an AI coach that helps you land the offer.
          </h2>

          <ul className="space-y-3">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-2.5 text-sm opacity-95"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm opacity-80">
          © 2026 MockMind. All rights reserved.
        </p>

        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {title}
            </h1>

            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {children}

          {footer && (
            <div className="text-center text-sm text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}