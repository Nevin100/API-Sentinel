"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";

function Svg({
  children,
  size = 18,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <Svg>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </Svg>
  ),
  endpoints: (
    <Svg>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </Svg>
  ),
  tester: (
    <Svg>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  ),
  collections: (
    <Svg>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </Svg>
  ),
  inspect: (
    <Svg>
      <circle cx="12" cy="12" r="10" />
      <line x1="22" x2="18" y1="12" y2="12" />
      <line x1="6" x2="2" y1="12" y2="12" />
      <line x1="12" x2="12" y1="6" y2="2" />
      <line x1="12" x2="12" y1="22" y2="18" />
    </Svg>
  ),
};

export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/endpoints", label: "Endpoints", icon: "endpoints" },
  { href: "/tester", label: "API Tester", icon: "tester" },
  { href: "/collections", label: "Collections", icon: "collections" },
  { href: "/inspect", label: "Deep Inspect", icon: "inspect" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-[#fef3e2] font-medium text-[#b45309]"
                : "text-[#78716c] hover:bg-[#f5f0e8] hover:text-[#1c1917]"
            }`}
          >
            <span className={active ? "text-[#b45309]" : "text-[#a8a29e]"}>
              {ICONS[item.icon]}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#1c1917] text-[#faf7f1]">
        <Svg size={16}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </Svg>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-[#1c1917]">
          API Sentinel
        </span>
        <span className="block text-[11px] text-[#a8a29e]">v1.0</span>
      </span>
    </Link>
  );
}

function ProfileRow({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) return null;
  return (
    <div className="border-t border-[#e7e0d5] pt-3">
      <Link
        href="/profile"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#f5f0e8]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fef3e2] text-sm font-semibold text-[#b45309]">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-medium text-[#1c1917]">
            {user.name}
          </span>
          <span className="block truncate text-xs text-[#a8a29e]">
            {user.email}
          </span>
        </span>
      </Link>
      <button
        onClick={() => {
          logout();
          onNavigate?.();
          router.push("/login");
        }}
        className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#a8a29e] hover:bg-[#f5f0e8] hover:text-[#1c1917]"
      >
        <Svg size={18}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </Svg>
        Log out
      </button>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[#e7e0d5] bg-[#fbf8f2] p-4 md:flex">
      <div className="px-1 pb-6 pt-1">
        <Logo />
      </div>
      <div className="flex-1">
        <NavLinks />
      </div>
      <ProfileRow />
    </aside>
  );
}

export function MobileTopbar({ onMenu }: { onMenu: () => void }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#e7e0d5] bg-[#fbf8f2]/95 px-4 backdrop-blur md:hidden">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="rounded-lg p-2 text-[#57534e] hover:bg-[#f5f0e8]"
      >
        <Svg size={20}>
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </Svg>
      </button>
      <span className="text-sm font-semibold text-[#1c1917]">API Sentinel</span>
      <Link
        href="/profile"
        className="grid h-8 w-8 place-items-center rounded-full bg-[#fef3e2] text-xs font-semibold text-[#b45309]"
      >
        {user ? user.name.charAt(0).toUpperCase() : "?"}
      </Link>
    </header>
  );
}

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-[#e7e0d5] bg-[#fbf8f2] p-4">
        <div className="flex items-center justify-between px-1 pb-6 pt-1">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-[#78716c] hover:bg-[#f5f0e8]"
          >
            <Svg size={18}>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </Svg>
          </button>
        </div>
        <div className="flex-1">
          <NavLinks onNavigate={onClose} />
        </div>
        <ProfileRow onNavigate={onClose} />
      </div>
    </div>
  );
}
