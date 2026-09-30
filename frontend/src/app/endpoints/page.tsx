/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
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
      <h1 className="text-2xl font-bold">Monitored endpoints</h1>

      <Card>
        <div className="flex gap-2 flex-col sm:flex-row">
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
            className={inputCls}
          />
          <button onClick={create} className={btnCls + " shrink-0"}>
            Add
          </button>
        </div>
      </Card>

      <div className="space-y-2">
        {list.map((e: any) => (
          <Card key={e.id} className="!p-3">
            <div className="flex items-center justify-between gap-4">
              <Link href={`/endpoints/${e.id}`} className="flex-1 min-w-0">
                <div className="font-medium hover:underline">{e.name}</div>
                <div className="text-xs text-zinc-500 truncate">
                  {e.method} {e.url}
                </div>
              </Link>
              <StatusBadge ok={e.is_active ? undefined : false} />
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
          <p className="text-zinc-500 text-sm">Abhi koi endpoint nahi hai.</p>
        )}
      </div>
    </div>
  );
}
