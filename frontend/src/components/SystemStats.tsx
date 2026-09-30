"use client";

import { useEffect, useState } from "react";
import { api, type SystemStats } from "../lib/api";

function Meter({ label, pct, detail }: { label: string; pct: number; detail: string }) {
  const color = pct > 85 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span>
        <span>
          {pct.toFixed(0)}% · {detail}
        </span>
      </div>
      <div className="h-2 rounded bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function SystemStatsPanel() {
  const [s, setS] = useState<SystemStats | null>(null);
  const [hist, setHist] = useState<number[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const d = await api.system();
        if (!alive) return;
        setS(d);
        setHist((h) => [...h.slice(-29), d.cpu_percent]);
      } catch {
        /* backend unreachable — retry silently */
      }
    };
    load();
    const t = setInterval(load, 3000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!s) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-200">System · live</h3>
        <span className="text-xs text-zinc-500">{s.cpu_count} cores</span>
      </div>

      {/* CPU sparkline — last ~90 seconds */}
      <div className="flex items-end gap-[2px] h-10 mb-4">
        {hist.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-emerald-500/70"
            style={{ height: `${Math.max(v, 4)}%` }}
            title={`${v.toFixed(1)}%`}
          />
        ))}
      </div>

      <div className="space-y-3">
        <Meter label="CPU" pct={s.cpu_percent} detail={`${s.cpu_count} cores`} />
        <Meter label="RAM" pct={s.ram_percent} detail={`${s.ram_used_gb}/${s.ram_total_gb} GB`} />
        <Meter label="Disk" pct={s.disk_percent} detail={`${s.disk_used_gb}/${s.disk_total_gb} GB`} />
      </div>
    </div>
  );
}
