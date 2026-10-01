/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { Card, StatusBadge, btnCls, btnGhost, btnDanger, inputCls } from "../../components/ui";

export default function EndpointsPage() {
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const load = async () => {
    try {
      setList(await api.listEndpoints());
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!name.trim() || !url.trim()) return;
    await api.createEndpoint({ name: name.trim(), url: url.trim() });
    setName("");
    setUrl("");
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this endpoint and its history?")) return;
    await api.deleteEndpoint(id);
    load();
  };

  const toggle = async (id: number) => {
    await api.toggleEndpoint(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Monitoring</p>
        <h1 className="font-display text-3xl">Endpoints</h1>
        <p className="mt-1 text-sm text-[#78716c]">
          Add a URL, Sentinel checks it on your schedule.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. GitHub API)"
            className={inputCls}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/health"
            className={`${inputCls} mono`}
          />
          <button onClick={create} className={`${btnCls} shrink-0`}>
            Add endpoint
          </button>
        </div>
      </Card>

      <div className="space-y-2">
        {list.map((e: any) => (
          <Card key={e.id}>
            <div className="flex items-center justify-between gap-4">
              <Link href={`/endpoints/${e.id}`} className="min-w-0 flex-1">
                <div className="font-medium hover:underline">{e.name}</div>
                <div className="mono truncate text-xs text-[#a8a29e]">
                  {e.method} {e.url}
                </div>
              </Link>
              <span className={e.is_active ? "" : "opacity-50"}>
                <StatusBadge ok={e.is_active ? undefined : false} />
              </span>
              <button onClick={() => toggle(e.id)} className={btnGhost}>
                {e.is_active ? "Pause" : "Resume"}
              </button>
              <button onClick={() => remove(e.id)} className={btnDanger}>
                Delete
              </button>
            </div>
          </Card>
        ))}
        {list.length === 0 && (
          <p className="text-sm text-[#a8a29e]">Abhi koi endpoint nahi hai.</p>
        )}
      </div>
    </div>
  );
}
