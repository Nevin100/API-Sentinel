/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { api } from "../../lib/api";
import { Card, StatusBadge, btnCls, inputCls } from "../../components/ui";
import { Waterfall } from "../../components/charts";

export default function InspectPage() {
  const [url, setUrl] = useState("https://github.com");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inspect = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      setData(await api.deepInspect(url));
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const wf = data?.waterfall;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Deep Inspect <span className="text-zinc-500 text-base font-normal">— network X-ray</span></h1>

      <Card>
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className={inputCls} />
          <button onClick={inspect} disabled={loading || !url} className={btnCls + " shrink-0"}>
            {loading ? "Inspecting…" : "Inspect"}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </Card>

      {data && (
        <>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge ok={data.http?.ok} />
              <span className="font-mono text-lg">{data.http?.status_code ?? "—"}</span>
              <span className="text-zinc-400 text-sm font-mono">total {data.timing?.total_ms}ms</span>
            </div>
            {wf?.ok ? (
              <Waterfall phases={wf.phases} />
            ) : (
              <p className="text-red-400 text-sm">Waterfall failed: {wf?.error}</p>
            )}
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold mb-2">DNS</h3>
              {data.dns?.ok ? (
                <>
                  <div className="text-sm font-mono">{data.dns.ips.join(", ")}</div>
                  <div className="text-xs text-zinc-500 mt-1">lookup {data.dns.lookup_ms}ms</div>
                </>
              ) : (
                <p className="text-red-400 text-sm">{data.dns?.error}</p>
              )}
            </Card>
            <Card>
              <h3 className="font-semibold mb-2">SSL / TLS</h3>
              {data.ssl ? (
                data.ssl.ok ? (
                  <div className="text-sm space-y-1">
                    <div><span className="text-zinc-500">TLS:</span> <span className="font-mono">{data.ssl.tls_version}</span></div>
                    <div><span className="text-zinc-500">Cipher:</span> <span className="font-mono">{data.ssl.cipher}</span></div>
                    <div><span className="text-zinc-500">Valid till:</span> <span className="font-mono">{data.ssl.not_after}</span></div>
                  </div>
                ) : (
                  <p className="text-red-400 text-sm">{data.ssl.error}</p>
                )
              ) : (
                <p className="text-zinc-500 text-sm">HTTP URL — no TLS.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
