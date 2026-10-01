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
      <div>
        <p className="eyebrow mb-2">Organize</p>
        <h1 className="font-display text-3xl">Collections & environments</h1>
        <p className="mt-1 text-sm text-[#78716c]">
          Group requests, swap variables between dev and prod.
        </p>
      </div>

      <Card>
        <h3 className="mb-2 font-semibold">
          Environments{" "}
          {activeEnv && (
            <span className="text-sm font-medium text-[#047857]">
              · active: {activeEnv.name}
            </span>
          )}
        </h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {envs.map((e: any) => (
            <button
              key={e.id}
              onClick={() => api.activateEnvironment(e.id).then(loadEnvs)}
              className={
                e.is_active
                  ? "rounded-lg bg-[#047857] px-3 py-1.5 text-xs font-medium text-white"
                  : btnGhost
              }
            >
              {e.name}
            </button>
          ))}
          {envs.length === 0 && (
            <span className="text-sm text-[#a8a29e]">Koi environment nahi.</span>
          )}
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <input value={envName} onChange={(e) => setEnvName(e.target.value)} placeholder="Env name (dev)" className={inputCls} />
          <input value={envVars} onChange={(e) => setEnvVars(e.target.value)} placeholder='{"base_url": "..."}' className={`${inputCls} mono`} />
          <button onClick={createEnv} className={btnCls}>Create env</button>
        </div>
        <p className="mt-2 text-xs text-[#a8a29e]">
          Requests me <span className="mono">{"{{base_url}}"}</span> jaise variables active env se resolve honge.
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <h3 className="font-semibold">Collections</h3>
          <div className="flex gap-2">
            <input value={colName} onChange={(e) => setColName(e.target.value)} placeholder="New collection" className={inputCls} />
            <button onClick={createCol} className={`${btnCls} shrink-0`}>Add</button>
          </div>
          {collections.map((c: any) => (
            <button
              key={c.id}
              onClick={() => selectCol(c)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                selCol?.id === c.id
                  ? "border-[#b45309] bg-[#fef3e2]"
                  : "border-[#e7e0d5] bg-white hover:border-[#a8a29e]"
              }`}
            >
              <span className="font-medium">📁 {c.name}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3 md:col-span-2">
          {!selCol ? (
            <p className="text-sm text-[#a8a29e]">Ek collection select kar.</p>
          ) : (
            <>
              <h3 className="font-semibold">Requests in {selCol.name}</h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input value={reqName} onChange={(e) => setReqName(e.target.value)} placeholder="Name" className={inputCls} />
                <select value={reqMethod} onChange={(e) => setReqMethod(e.target.value)} className="input mono shrink-0">
                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => <option key={m}>{m}</option>)}
                </select>
                <input value={reqUrl} onChange={(e) => setReqUrl(e.target.value)} placeholder="{{base_url}}/users" className={`${inputCls} mono`} />
                <button onClick={saveReq} className={`${btnCls} shrink-0`}>Save</button>
              </div>
              {requests.map((r: any) => (
                <Card key={r.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="mono mr-2 rounded bg-[#f5f0e8] px-1.5 py-0.5 text-xs">{r.method}</span>
                      <span className="font-medium">{r.name}</span>
                      <div className="mono truncate text-xs text-[#a8a29e]">{r.url}</div>
                    </div>
                    <button onClick={() => sendReq(r.id)} disabled={sendingId === r.id} className={`${btnCls} shrink-0`}>
                      {sendingId === r.id ? "…" : "Send"}
                    </button>
                  </div>
                </Card>
              ))}
              {requests.length === 0 && <p className="text-sm text-[#a8a29e]">Koi saved request nahi.</p>}
            </>
          )}

          {resp && (
            <Card>
              <div className="mb-2 flex items-center gap-3">
                <StatusBadge ok={resp.ok} />
                <span className={`mono text-xl ${resp.ok ? "text-[#047857]" : "text-[#b91c1c]"}`}>
                  {resp.status_code ?? "ERROR"}
                </span>
                <span className="mono text-sm text-[#78716c]">{resp.latency_ms}ms</span>
              </div>
              {resp.error && <div className="error-box mb-2">{resp.error}</div>}
              <pre className="pre-dark max-h-80">
                {typeof resp.body === "string" ? resp.body.slice(0, 5000) : JSON.stringify(resp, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
