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
      <div>
        <p className="eyebrow mb-2">Network X-ray</p>
        <h1 className="font-display text-3xl">Deep Inspect</h1>
        <p className="mt-1 text-sm text-[#78716c]">
          Paste a URL — see DNS, TCP, TLS and TTFB in a waterfall.
        </p>
      </div>

      <Card>
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className={`${inputCls} mono`} />
          <button onClick={inspect} disabled={loading || !url} className={`${btnCls} shrink-0`}>
            {loading ? "Inspecting…" : "Inspect"}
          </button>
        </div>
        {error && <div className="error-box mt-3">{error}</div>}
      </Card>

      {data && (
        <>
          <Card>
            <div className="mb-4 flex items-center gap-3">
              <StatusBadge ok={data.http?.ok} />
              <span className="mono text-xl">{data.http?.status_code ?? "—"}</span>
              <span className="mono text-sm text-[#78716c]">total {data.timing?.total_ms}ms</span>
            </div>
            {wf?.ok ? (
              <Waterfall phases={wf.phases} />
            ) : (
              <div className="error-box">Waterfall failed: {wf?.error}</div>
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="mb-2 font-semibold">DNS</h3>
              {data.dns?.ok ? (
                <>
                  <div className="mono text-sm">{data.dns.ips.join(", ")}</div>
                  <div className="mt-1 text-xs text-[#a8a29e]">lookup {data.dns.lookup_ms}ms</div>
                </>
              ) : (
                <div className="error-box">{data.dns?.error}</div>
              )}
            </Card>
            <Card>
              <h3 className="mb-2 font-semibold">SSL / TLS</h3>
              {data.ssl ? (
                data.ssl.ok ? (
                  <div className="space-y-1 text-sm">
                    <div><span className="text-[#a8a29e]">TLS:</span> <span className="mono">{data.ssl.tls_version}</span></div>
                    <div><span className="text-[#a8a29e]">Cipher:</span> <span className="mono">{data.ssl.cipher}</span></div>
                    <div><span className="text-[#a8a29e]">Valid till:</span> <span className="mono">{data.ssl.not_after}</span></div>
                  </div>
                ) : (
                  <div className="error-box">{data.ssl.error}</div>
                )
              ) : (
                <p className="text-sm text-[#a8a29e]">HTTP URL — no TLS.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
