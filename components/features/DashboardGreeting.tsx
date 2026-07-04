"use client";

import { useSession } from "next-auth/react";
import { useUserStore } from "@/app/store/useUserStore";
import { useEffect, useState } from "react";
import { currentUser } from "@/lib/mock-data";

export function DashboardGreeting() {
  const { data: session } = useSession();
  const { user: storeUser } = useUserStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userDisplayName = isMounted ? storeUser.name : (session?.user?.name || currentUser.name);
  const firstName = userDisplayName?.split(" ")[0] || "User";

  return (
    <>
      <p className="text-sm font-medium opacity-90">
        Welcome back,
      </p>

      <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
        {firstName} 👋
      </h1>
    </>
  );
}
