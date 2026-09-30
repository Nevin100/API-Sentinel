/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, StatusBadge, btnCls, btnGhost, inputCls } from "../../components/ui";

export default function CollectionsPage() {
  const [envs, setEnvs] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selCol, setSelCol] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [resp, setResp] = useState<any>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);

  const [envName, setEnvName] = useState("");
  const [envVars, setEnvVars] = useState('{"base_url": "https://api.github.com"}');
  const [colName, setColName] = useState("");
  const [reqName, setReqName] = useState("");
  const [reqMethod, setReqMethod] = useState("GET");
  const [reqUrl, setReqUrl] = useState("");

  const loadEnvs = async () => {
    try { setEnvs(await api.listEnvironments()); } catch (e) { console.error(e); }
  };
  const loadCols = async () => {
    try { setCollections(await api.listCollections()); } catch (e) { console.error(e); }
  };
  const loadReqs = async (cid: number) => {
    try { setRequests(await api.listSavedRequests(cid)); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadEnvs();
    loadCols();
  }, []);

  const selectCol = (c: any) => {
    setSelCol(c);
    setResp(null);
    loadReqs(c.id);
  };

  const createEnv = async () => {
    try {
      await api.createEnvironment(envName.trim(), JSON.parse(envVars || "{}"));
      setEnvName("");
      loadEnvs();
    } catch (e: any) {
      alert("Invalid JSON in variables: " + e.message);
    }
  };

  const createCol = async () => {
    if (!colName.trim()) return;
    await api.createCollection(colName.trim());
    setColName("");
    loadCols();
  };

  const saveReq = async () => {
    if (!selCol || !reqName.trim() || !reqUrl.trim()) return;
    await api.saveRequest(selCol.id, {
      name: reqName.trim(),
      method: reqMethod,
      url: reqUrl.trim(),
    });
    setReqName("");
    setReqUrl("");
    loadReqs(selCol.id);
  };

  const sendReq = async (rid: number) => {
    setSendingId(rid);
    setResp(null);
    try {
      setResp(await api.sendSaved(rid));
    } catch (e: any) {
      setResp({ ok: false, error: e.message });
    }
    setSendingId(null);
  };

  const activeEnv = envs.find((e: any) => e.is_active);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Collections & environments</h1>

      <Card>
        <h3 className="font-semibold mb-2">Environments {activeEnv && <span className="text-emerald-400 text-sm">· active: {activeEnv.name}</span>}</h3>
        <div className="flex gap-2 flex-wrap mb-3">
          {envs.map((e: any) => (
            <button
              key={e.id}
              onClick={() => api.activateEnvironment(e.id).then(loadEnvs)}
              className={e.is_active ? "bg-emerald-700 text-white px-3 py-1.5 rounded-md text-xs" : btnGhost}
            >
              {e.name}
            </button>
          ))}
          {envs.length === 0 && <span className="text-zinc-500 text-sm">Koi environment nahi.</span>}
        </div>
        <div className="grid md:grid-cols-3 gap-2">
          <input value={envName} onChange={(e) => setEnvName(e.target.value)} placeholder="Env name (dev)" className={inputCls} />
          <input value={envVars} onChange={(e) => setEnvVars(e.target.value)} placeholder='{"base_url": "..."}' className={inputCls + " font-mono"} />
          <button onClick={createEnv} className={btnCls}>Create env</button>
        </div>
        <p className="text-xs text-zinc-500 mt-2">Requests me <span className="font-mono">{"{{base_url}}"}</span> jaise variables active env se resolve honge.</p>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold">Collections</h3>
          <div className="flex gap-2">
            <input value={colName} onChange={(e) => setColName(e.target.value)} placeholder="New collection" className={inputCls} />
            <button onClick={createCol} className={btnCls + " shrink-0"}>Add</button>
          </div>
          {collections.map((c: any) => (
            <button
              key={c.id}
              onClick={() => selectCol(c)}
              className={`w-full text-left p-3 rounded-xl border ${selCol?.id === c.id ? "bg-zinc-800 border-zinc-600" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"}`}
            >
              <span className="font-medium">📁 {c.name}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3 md:col-span-2">
          {!selCol ? (
            <p className="text-zinc-500 text-sm">Ek collection select kar.</p>
          ) : (
            <>
              <h3 className="font-semibold">Requests in {selCol.name}</h3>
              <div className="flex gap-2 flex-col sm:flex-row">
                <input value={reqName} onChange={(e) => setReqName(e.target.value)} placeholder="Name" className={inputCls} />
                <select value={reqMethod} onChange={(e) => setReqMethod(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm">
                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => <option key={m}>{m}</option>)}
                </select>
                <input value={reqUrl} onChange={(e) => setReqUrl(e.target.value)} placeholder="{{base_url}}/users" className={inputCls} />
                <button onClick={saveReq} className={btnCls + " shrink-0"}>Save</button>
              </div>
              {requests.map((r: any) => (
                <Card key={r.id} className="!p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono text-xs bg-zinc-800 px-1.5 py-0.5 rounded mr-2">{r.method}</span>
                      <span className="font-medium">{r.name}</span>
                      <div className="text-xs text-zinc-500 truncate font-mono">{r.url}</div>
                    </div>
                    <button onClick={() => sendReq(r.id)} disabled={sendingId === r.id} className={btnCls + " shrink-0"}>
                      {sendingId === r.id ? "…" : "Send"}
                    </button>
                  </div>
                </Card>
              ))}
              {requests.length === 0 && <p className="text-zinc-500 text-sm">Koi saved request nahi.</p>}
            </>
          )}

          {resp && (
            <Card>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge ok={resp.ok} />
                <span className={`font-mono text-lg ${resp.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {resp.status_code ?? "ERROR"}
                </span>
                <span className="text-zinc-400 text-sm font-mono">{resp.latency_ms}ms</span>
              </div>
              {resp.error && <p className="text-red-400 text-sm mb-2">{resp.error}</p>}
              <pre className="text-xs bg-zinc-950 rounded p-3 overflow-auto max-h-80">
                {typeof resp.body === "string" ? resp.body.slice(0, 5000) : JSON.stringify(resp, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
