"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  User,
  Settings,
  FileText,
  LogOut,
  Menu,
  Sparkles,
} from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/app/store/useUserStore";
import { useProfile } from "@/hooks/useProfile";
import { useResume } from "@/hooks/useResume";

const nav = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/new",
    label: "New Interview",
    icon: PlusCircle,
  },
  {
    href: "/dashboard/interviews",
    label: "History",
    icon: History,
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

function SidebarNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const sessionUser = session?.user;
  const { user: storeUser, updateUser } = useUserStore();

  // Sync real session data into the store whenever session loads
  useEffect(() => {
    if (sessionUser?.name || sessionUser?.email) {
      updateUser({
        name: sessionUser.name ?? storeUser.name,
        email: sessionUser.email ?? storeUser.email,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.name, sessionUser?.email]);

  // Session is the primary source; store fills in profile extras (title, location, etc.)
  const userDisplayName = sessionUser?.name || storeUser.name || "";
  const userEmail = sessionUser?.email || storeUser.email || "";

  const initials = userDisplayName
    ? userDisplayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <div className="px-3 pb-3">
        <Button
          asChild
          className="w-full justify-start gap-2 rounded-xl gradient-primary text-primary-foreground shadow-soft hover:opacity-90"
        >
          <Link href="/dashboard/new" onClick={onNavigate}>
            <Sparkles className="h-4 w-4" />
            Start Interview
          </Link>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href, item.exact)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {userDisplayName}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {userEmail}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg"
            aria-label="Log out"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  if (status === "unauthenticated") {
    return null;
  }

  const { profile, loading: profileLoading } = useProfile();
  const { resume, loading: resumeLoading } = useResume();

  const isProfileIncomplete = profile && !profile.profileCompleted;
  const isResumeMissing = !resumeLoading && !resume;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarNav />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">
                Navigation
              </SheetTitle>

              <SidebarNav onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden rounded-xl sm:inline-flex"
            >
              <Link href="/dashboard/new">
                <FileText className="mr-1.5 h-4 w-4" />
                Upload Resume
              </Link>
            </Button>

            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {!(profileLoading || resumeLoading) && (isProfileIncomplete || isResumeMissing) && (
            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300 backdrop-blur-sm shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                    ⚠️ Complete Your Setup
                  </h4>
                  <p className="text-xs sm:text-sm opacity-90 mt-1">
                    {isProfileIncomplete && "Your profile details are incomplete. "}
                    {isResumeMissing && "You haven't uploaded a resume yet. "}
                    Please complete these steps to enable AI mock interviews.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {isProfileIncomplete && (
                    <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                      <Link href="/dashboard/profile">Complete Profile</Link>
                    </Button>
                  )}
                  {isResumeMissing && (
                    <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
                      <Link href="/dashboard/profile">Upload Resume</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}