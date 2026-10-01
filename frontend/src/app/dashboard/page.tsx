/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import EndpointCard from "../../components/EndpointCard";
import { Card } from "../../components/ui";
import { SystemStatsPanel } from "../../components/SystemStats";
import { useAuth } from "../../lib/auth";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any[]>([]);
  const [failures, setFailures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, f] = await Promise.all([api.summary(), api.failures(10)]);
      setSummary(s);
      setFailures(f);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading)
    return <p className="text-sm text-[#a8a29e]">Loading…</p>;

  const up = summary.filter((e) => e.last_ok).length;
  const down = summary.filter((e) => e.last_ok === false).length;
  const firstName = user?.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-2">Overview</p>
        <h1 className="font-display text-3xl md:text-4xl">
          {firstName ? `Good to see you, ${firstName}.` : "Dashboard."}
        </h1>
        <p className="mt-1 text-sm text-[#78716c]">
          {down > 0
            ? `${down} endpoint${down > 1 ? "s" : ""} need${down > 1 ? "" : "s"} attention right now.`
            : "Everything you watch is answering."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-xs font-medium uppercase tracking-wider text-[#a8a29e]">
            Endpoints
          </div>
          <div className="font-display mt-1 text-4xl">{summary.length}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium uppercase tracking-wider text-[#a8a29e]">
            Up
          </div>
          <div className="font-display mt-1 text-4xl text-[#047857]">{up}</div>
        </Card>
        <Card>
          <div className="text-xs font-medium uppercase tracking-wider text-[#a8a29e]">
            Down
          </div>
          <div className="font-display mt-1 text-4xl text-[#b91c1c]">{down}</div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Endpoints</h2>
            {summary.length === 0 ? (
              <Card>
                <p className="text-sm text-[#78716c]">
                  Koi endpoint nahi —{" "}
                  <Link href="/endpoints" className="font-medium text-[#b45309] hover:underline">
                    yahan bana
                  </Link>
                  .
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {summary.map((e) => (
                  <EndpointCard key={e.id} ep={e} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Recent failures</h2>
            <Card>
              {failures.length === 0 ? (
                <p className="text-sm text-[#78716c]">
                  Sab badhiya — koi failure nahi.
                </p>
              ) : (
                <div className="space-y-2">
                  {failures.map((f: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between gap-4 border-b border-[#f5f0e8] pb-2 text-sm last:border-0 last:pb-0"
                    >
                      <span className="truncate">
                        <span className="font-semibold text-[#b91c1c]">
                          {f.endpoint_name}
                        </span>{" "}
                        <span className="text-[#a8a29e]">
                          {String(f.error || f.status_code).slice(0, 90)}
                        </span>
                      </span>
                      <span className="mono shrink-0 text-xs text-[#a8a29e]">
                        {new Date(f.checked_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">This machine</h2>
          <SystemStatsPanel />
        </div>
      </div>
    </div>
  );
}
