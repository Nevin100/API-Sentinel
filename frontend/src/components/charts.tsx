"use client";

/** Last-N check results as green/red latency bars. */
export function LatencyBars({
  results,
}: {
  results: { latency_ms: number | null; ok: boolean }[];
}) {
  const data = results.slice(0, 40).reverse();
  const max = Math.max(...data.map((r) => r.latency_ms || 0), 1);
  if (data.length === 0)
    return <p className="text-zinc-500 text-sm">No checks yet</p>;
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((r, i) => (
        <div
          key={i}
          title={`${r.latency_ms ?? "?"}ms`}
          className={`flex-1 rounded-sm ${r.ok ? "bg-emerald-600" : "bg-red-600"}`}
          style={{
            height: `${Math.max(6, ((r.latency_ms || 0) / max) * 100)}%`,
          }}
        />
      ))}
    </div>
  );
}

/** GitHub-style per-day uptime squares. */
export function Heatmap({
  days,
}: {
  days: { date: string; uptime_pct: number }[];
}) {
  const color = (p: number) =>
    p >= 99
      ? "bg-emerald-500"
      : p >= 95
      ? "bg-emerald-800"
      : p >= 90
      ? "bg-yellow-600"
      : p >= 50
      ? "bg-orange-600"
      : "bg-red-600";
  if (days.length === 0)
    return <p className="text-zinc-500 text-sm">No data yet</p>;
  return (
    <div className="flex gap-1 flex-wrap">
      {days.map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.uptime_pct}%`}
          className={`w-4 h-4 rounded-sm ${color(d.uptime_pct)}`}
        />
      ))}
    </div>
  );
}

/** DNS -> TCP -> TLS -> TTFB phase breakdown bars. */
export function Waterfall({
  phases,
}: {
  phases: {
    dns_ms: number;
    tcp_ms: number;
    tls_ms: number;
    ttfb_ms: number;
    total_ms: number;
  };
}) {
  const rows: [string, number, string][] = [
    ["DNS lookup", phases.dns_ms, "bg-sky-500"],
    ["TCP connect", phases.tcp_ms, "bg-violet-500"],
    ["TLS handshake", phases.tls_ms, "bg-amber-500"],
    ["Time to first byte", phases.ttfb_ms, "bg-emerald-500"],
  ];
  const max = Math.max(phases.total_ms, 1);
  return (
    <div className="space-y-2">
      {rows.map(([label, ms, cls]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-36 text-sm text-zinc-400">{label}</span>
          <div className="flex-1 h-5 bg-zinc-800 rounded">
            <div
              className={`h-5 rounded ${cls}`}
              style={{ width: `${Math.max(2, (ms / max) * 100)}%` }}
            />
          </div>
          <span className="w-24 text-right text-sm font-mono">
            {ms.toFixed(1)}ms
          </span>
        </div>
      ))}
      <div className="text-right text-sm text-zinc-400">
        total{" "}
        <span className="font-mono text-white">
          {phases.total_ms.toFixed(1)}ms
        </span>
      </div>
    </div>
  );
}
