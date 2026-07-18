"use client";

import { ReactNode } from "react";

interface InterviewLayoutProps {
  children: ReactNode;
}

export default function InterviewLayout({
  children,
}: InterviewLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background">
      {children}
    </div>
  );
}   