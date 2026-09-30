/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { Card, StatusBadge, timeAgo } from "./ui";

export default function EndpointCard({ ep }: { ep: any }) {
  return (
    <Link href={`/endpoints/${ep.id}`}>
      <Card className="hover:border-zinc-600 transition cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">{ep.name}</span>
          <StatusBadge ok={ep.last_ok} />
        </div>
        <div className="text-xs text-zinc-500 truncate mb-3">{ep.url}</div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">
            uptime 24h{" "}
            <span className="text-white font-mono">{ep.uptime_24h_pct}%</span>
          </span>
          <span className="text-zinc-400">
            <span className="text-white font-mono">
              {ep.last_latency_ms != null ? `${ep.last_latency_ms.toFixed(0)}ms` : "—"}
            </span>{" "}
            · {timeAgo(ep.last_checked_at)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
