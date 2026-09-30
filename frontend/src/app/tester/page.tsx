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
      <h1 className="text-2xl font-bold">Request tester</h1>

      <Card>
        <div className="flex gap-2 mb-3">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm"
          >
            {METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className={inputCls}
          />
          <button onClick={send} disabled={loading || !url} className={btnCls + " shrink-0"}>
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500">Headers (JSON)</label>
            <textarea
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              rows={3}
              className={inputCls + " font-mono"}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500">Body</label>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={3}
              className={inputCls + " font-mono"}
            />
          </div>
        </div>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </Card>

      {resp && (
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <StatusBadge ok={resp.ok} />
            <span className={`font-mono text-lg ${resp.ok ? "text-emerald-400" : "text-red-400"}`}>
              {resp.status_code ?? "ERROR"}
            </span>
            <span className="text-zinc-400 text-sm font-mono">{resp.latency_ms}ms</span>
            <span className="text-zinc-400 text-sm font-mono">{resp.size_bytes} bytes</span>
          </div>
          {resp.error && <p className="text-red-400 text-sm mb-3">{resp.error}</p>}
          <details className="mb-2">
            <summary className="text-sm text-zinc-400 cursor-pointer">Headers</summary>
            <pre className="text-xs bg-zinc-950 rounded p-3 mt-2 overflow-auto">
              {JSON.stringify(resp.headers, null, 2)}
            </pre>
          </details>
          <div className="text-sm text-zinc-400 mb-1">Body</div>
          <pre className="text-xs bg-zinc-950 rounded p-3 overflow-auto max-h-96">
            {resp.body}
          </pre>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Request log</h2>
        <Card>
          <div className="text-sm">
            <div className="grid grid-cols-5 gap-2 text-zinc-500 text-xs pb-2 border-b border-zinc-800">
              <span>Method</span><span className="col-span-2">URL</span><span>Status</span><span>Latency</span>
            </div>
            {logs.map((l: any) => (
              <div key={l.id} className="grid grid-cols-5 gap-2 py-1.5 border-b border-zinc-800/50">
                <span className="font-mono">{l.method}</span>
                <span className="col-span-2 truncate text-zinc-400">{l.url}</span>
                <span className={l.status_code && l.status_code < 400 ? "text-emerald-400" : "text-red-400"}>
                  {l.status_code ?? "ERR"}
                </span>
                <span className="font-mono">{l.latency_ms?.toFixed(0)}ms</span>
              </div>
            ))}
            {logs.length === 0 && <p className="text-zinc-500 text-sm py-2">Koi request nahi bheji abhi.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
