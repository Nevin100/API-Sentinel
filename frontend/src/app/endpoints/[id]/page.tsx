/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../../lib/api";
import { Card, StatusBadge } from "../../../components/ui";
import { LatencyBars, Heatmap } from "../../../components/charts";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-zinc-400 text-xs">{label}</div>
      <div className="font-mono text-lg">{value}</div>
    </div>
  );
}

export default function EndpointDetail() {
  const { id } = useParams();
  const eid = Number(id);
  const [info, setInfo] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [eps, s, d, r] = await Promise.all([
          api.listEndpoints(),
          api.endpointStats(eid),
          api.dailyUptime(eid),
          api.getResults(eid, 40),
        ]);
        setInfo(eps.find((e: any) => e.id === eid));
        setStats(s);
        setDaily(d);
        setResults(r);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [eid]);

  if (!stats) return <p className="text-zinc-500">Loading…</p>;
  const w = stats["24h"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{info?.name || `Endpoint #${eid}`}</h1>
        <StatusBadge ok={stats.last_check?.ok} />
      </div>
      <p className="text-zinc-500 text-sm -mt-4">{info?.url}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><Stat label="Uptime 24h" value={`${w.uptime_pct}%`} /></Card>
        <Card><Stat label="Uptime 7d" value={`${stats["7d"].uptime_pct}%`} /></Card>
        <Card><Stat label="p95 latency" value={w.latency_ms.p95 != null ? `${w.latency_ms.p95}ms` : "—"} /></Card>
        <Card><Stat label="Checks 24h" value={`${w.total_checks} (${w.failed_checks} failed)`} /></Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-3">Latency percentiles (24h)</h3>
        <div className="grid grid-cols-5 gap-2 text-center">
          {["avg", "p50", "p95", "p99", "max"].map((k) => (
            <div key={k} className="bg-zinc-800 rounded-lg p-2">
              <div className="text-xs text-zinc-500">{k}</div>
              <div className="font-mono">
                {w.latency_ms[k] != null ? `${w.latency_ms[k]}ms` : "—"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">Recent checks</h3>
        <LatencyBars results={results} />
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">Uptime heatmap (30d)</h3>
        <Heatmap days={daily} />
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">Check history</h3>
        <div className="text-sm">
          <div className="grid grid-cols-4 gap-2 text-zinc-500 text-xs pb-2 border-b border-zinc-800">
            <span>Time</span><span>Status</span><span>Latency</span><span>Error</span>
          </div>
          {results.slice(0, 15).map((r: any, i: number) => (
            <div key={i} className="grid grid-cols-4 gap-2 py-1.5 border-b border-zinc-800/50">
              <span className="text-zinc-400">{new Date(r.checked_at).toLocaleString()}</span>
              <span className={r.ok ? "text-emerald-400" : "text-red-400"}>
                {r.status_code ?? "ERR"}
              </span>
              <span className="font-mono">{r.latency_ms?.toFixed(0)}ms</span>
              <span className="text-zinc-500 truncate">{r.error ? String(r.error).slice(0, 60) : "—"}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
