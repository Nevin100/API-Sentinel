"use client";

export const inputCls = "input";
export const btnCls = "btn-primary";
export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e7e0d5] bg-transparent px-3 py-1.5 text-xs font-medium text-[#1c1917] transition-colors hover:bg-[#f5f0e8]";
export const btnDanger = "btn-danger";

export function StatusBadge({ ok }: { ok: boolean | null | undefined }) {
  if (ok === null || ok === undefined)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f0e8] px-2.5 py-0.5 text-xs text-[#78716c]">
        <span className="status-dot" style={{ background: "#a8a29e" }} />
        no data
      </span>
    );
  return ok ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d1fae5] px-2.5 py-0.5 text-xs font-medium text-[#047857]">
      <span className="status-dot up" />
      up
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fee2e2] px-2.5 py-0.5 text-xs font-medium text-[#b91c1c]">
      <span className="status-dot down" />
      down
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
    <div className={`panel panel-pad ${className}`}>{children}</div>
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
