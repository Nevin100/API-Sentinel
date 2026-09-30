/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import EndpointCard from "../components/EndpointCard";
import { Card } from "../components/ui";
import Link from "next/link";

export default function Dashboard() {
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

  if (loading) return <p className="text-zinc-500">Loading…</p>;

  const up = summary.filter((e) => e.last_ok).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-zinc-400 text-sm">Endpoints</div>
          <div className="text-3xl font-bold">{summary.length}</div>
        </Card>
        <Card>
          <div className="text-zinc-400 text-sm">Up</div>
          <div className="text-3xl font-bold text-emerald-400">{up}</div>
        </Card>
        <Card>
          <div className="text-zinc-400 text-sm">Down</div>
          <div className="text-3xl font-bold text-red-400">
            {summary.filter((e) => e.last_ok === false).length}
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Endpoints</h2>
        {summary.length === 0 ? (
          <p className="text-zinc-500">
            Koi endpoint nahi — <Link className="underline" href="/endpoints">yahan bana</Link>.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {summary.map((e) => (
              <EndpointCard key={e.id} ep={e} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent failures</h2>
        <Card>
          {failures.length === 0 ? (
            <p className="text-zinc-500 text-sm">Sab badhiya — koi failure nahi 🎉</p>
          ) : (
            <div className="space-y-2">
              {failures.map((f: any, i: number) => (
                <div
                  key={i}
                  className="text-sm flex justify-between gap-4 border-b border-zinc-800 pb-2"
                >
                  <span className="truncate">
                    <span className="text-red-400 font-semibold">{f.endpoint_name}</span>{" "}
                    <span className="text-zinc-500">
                      {String(f.error || f.status_code).slice(0, 90)}
                    </span>
                  </span>
                  <span className="text-zinc-500 shrink-0">
                    {new Date(f.checked_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
