"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const inputCls =
  "bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:border-zinc-500";
export const btnCls =
  "bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50";
export const btnGhost =
  "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-md text-xs";
export const btnDanger =
  "bg-red-950 hover:bg-red-900 text-red-300 px-3 py-1.5 rounded-md text-xs";

export function Navbar() {
  const path = usePathname();
  const links: [string, string][] = [
    ["Dashboard", "/"],
    ["Endpoints", "/endpoints"],
    ["Tester", "/tester"],
    ["Collections", "/collections"],
    ["Inspect", "/inspect"],
  ];
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 sticky top-0 z-10 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
        <span className="font-bold text-lg">🛰️ API Sentinel</span>
        <div className="flex gap-1 flex-wrap">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm ${
                path === href
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function StatusBadge({ ok }: { ok: boolean | null | undefined }) {
  if (ok === null || ok === undefined)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-700 text-zinc-300">
        no data
      </span>
    );
  return ok ? (
    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-900 text-emerald-300">
      ● up
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-xs bg-red-900 text-red-300">
      ● down
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-zinc-500">
        <span>🛰️ API Sentinel — monitor, test & X-ray your APIs</span>
        <span>
          <a href="http://localhost:8000/metrics" className="hover:text-white mr-4">metrics</a>
          <a href="http://localhost:8000/docs" className="hover:text-white">api docs</a>
        </span>
      </div>
    </footer>
  );
}
