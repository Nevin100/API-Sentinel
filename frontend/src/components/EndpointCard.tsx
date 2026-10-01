/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { Card, StatusBadge, timeAgo } from "./ui";

export default function EndpointCard({ ep }: { ep: any }) {
  return (
    <Link href={`/endpoints/${ep.id}`}>
      <Card className="cursor-pointer transition hover:border-[#a8a29e]">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold">{ep.name}</span>
          <StatusBadge ok={ep.last_ok} />
        </div>
        <div className="mb-3 truncate text-xs text-[#a8a29e]">{ep.url}</div>
        <div className="flex justify-between text-sm">
          <span className="text-[#78716c]">
            uptime 24h{" "}
            <span className="mono font-medium text-[#1c1917]">
              {ep.uptime_24h_pct}%
            </span>
          </span>
          <span className="text-[#78716c]">
            <span className="mono font-medium text-[#1c1917]">
              {ep.last_latency_ms != null
                ? `${ep.last_latency_ms.toFixed(0)}ms`
                : "—"}
            </span>{" "}
            · {timeAgo(ep.last_checked_at)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
