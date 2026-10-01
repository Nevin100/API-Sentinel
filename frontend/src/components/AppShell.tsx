"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { Sidebar, MobileTopbar, MobileDrawer } from "./Sidebar";

// These routes render without the sidebar.
const PUBLIC_PATHS = ["/", "/login", "/signup"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!isPublic && !loading && !user) {
      router.replace("/login");
    }
  }, [isPublic, loading, user, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-3 text-sm text-[#78716c]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#e7e0d5] border-t-[#b45309]" />
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#1c1917] md:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <MobileTopbar onMenu={() => setDrawerOpen(true)} />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
