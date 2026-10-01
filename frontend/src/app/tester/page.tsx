/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, StatusBadge, btnCls, inputCls } from "../../components/ui";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];

export default function TesterPage() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.github.com");
  const [headersText, setHeadersText] = useState("{}");
  const [bodyText, setBodyText] = useState("");
  const [resp, setResp] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLogs = async () => {
    try {
      setLogs(await api.getLogs(20));
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    loadLogs();
  }, []);

  const send = async () => {
    setLoading(true);
    setError("");
    setResp(null);
    try {
      const headers = JSON.parse(headersText || "{}");
      const r = await api.sendRequest({
        method,
        url,
        headers,
        body: bodyText || undefined,
      });
      setResp(r);
      loadLogs();
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Tools</p>
        <h1 className="font-display text-3xl">Request tester</h1>
        <p className="mt-1 text-sm text-[#78716c]">
          Fire a request, read the response, replay from history.
        </p>
      </div>

      <Card>
        <div className="mb-3 flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="input mono shrink-0"
          >
            {METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className={`${inputCls} mono`}
          />
          <button onClick={send} disabled={loading || !url} className={`${btnCls} shrink-0`}>
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="label">Headers (JSON)</label>
            <textarea
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              rows={3}
              className={`${inputCls} mono`}
            />
          </div>
          <div>
            <label className="label">Body</label>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={3}
              className={`${inputCls} mono`}
            />
          </div>
        </div>
        {error && <div className="error-box mt-3">{error}</div>}
      </Card>

      {resp && (
        <Card>
          <div className="mb-3 flex items-center gap-3">
            <StatusBadge ok={resp.ok} />
            <span className={`mono text-xl ${resp.ok ? "text-[#047857]" : "text-[#b91c1c]"}`}>
              {resp.status_code ?? "ERROR"}
            </span>
            <span className="mono text-sm text-[#78716c]">{resp.latency_ms}ms</span>
            <span className="mono text-sm text-[#78716c]">{resp.size_bytes} bytes</span>
          </div>
          {resp.error && <div className="error-box mb-3">{resp.error}</div>}
          <details className="mb-2">
            <summary className="cursor-pointer text-sm text-[#78716c]">Headers</summary>
            <pre className="pre-dark mt-2">{JSON.stringify(resp.headers, null, 2)}</pre>
          </details>
          <div className="label mt-3">Body</div>
          <pre className="pre-dark max-h-96">{resp.body}</pre>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">Request log</h2>
        <Card>
          <div className="text-sm">
            <div className="grid grid-cols-5 gap-2 border-b border-[#e7e0d5] pb-2 text-xs text-[#a8a29e]">
              <span>Method</span><span className="col-span-2">URL</span><span>Status</span><span>Latency</span>
            </div>
            {logs.map((l: any) => (
              <div key={l.id} className="grid grid-cols-5 gap-2 border-b border-[#f5f0e8] py-1.5 last:border-0">
                <span className="mono">{l.method}</span>
                <span className="col-span-2 truncate text-[#78716c]">{l.url}</span>
                <span className={l.status_code && l.status_code < 400 ? "font-medium text-[#047857]" : "font-medium text-[#b91c1c]"}>
                  {l.status_code ?? "ERR"}
                </span>
                <span className="mono">{l.latency_ms?.toFixed(0)}ms</span>
              </div>
            ))}
            {logs.length === 0 && <p className="py-2 text-sm text-[#a8a29e]">Koi request nahi bheji abhi.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
