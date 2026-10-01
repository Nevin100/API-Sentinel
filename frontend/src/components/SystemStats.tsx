"use client";

import { useEffect, useState } from "react";
import { api, type SystemStats } from "../lib/api";

function Meter({ label, pct, detail }: { label: string; pct: number; detail: string }) {
  const color =
    pct > 85 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-emerald-600";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-[#78716c]">
        <span>{label}</span>
        <span className="mono">
          {pct.toFixed(0)}% · {detail}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-[#f5f0e8]">
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
    <div className="panel panel-pad">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">System · live</h3>
        <span className="mono text-xs text-[#a8a29e]">{s.cpu_count} cores</span>
      </div>

      {/* CPU sparkline — last ~90 seconds */}
      <div className="mb-4 flex h-10 items-end gap-[2px]">
        {hist.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-emerald-600/70"
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
