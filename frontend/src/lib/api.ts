/* eslint-disable @typescript-eslint/no-explicit-any */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    // auth httpOnly cookie har request ke saath jayegi
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers || {}),
    },
  });
  if (res.status === 401) {
    throw new Error("Unauthorized — please log in again");
  }
  if (!res.ok) {
    let msg = `API ${res.status}`;
    try {
      const j = await res.json();
      if (j.detail) msg = typeof j.detail === "string" ? j.detail : msg;
    } catch {
      msg = `API ${res.status}: ${await res.text()}`;
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // ----- tester -----
  sendRequest: (body: { method: string; url: string; headers?: any; body?: string }) =>
    req<any>("/api/requests/send", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getLogs: (limit = 50) => req<any[]>(`/api/requests/logs?limit=${limit}`),

  // ----- monitored endpoints -----
  listEndpoints: () => req<any[]>("/api/endpoints"),
  createEndpoint: (body: {
    name: string;
    url: string;
    method?: string;
    interval_seconds?: number;
  }) =>
    req<any>("/api/endpoints", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteEndpoint: (id: number) =>
    req<any>(`/api/endpoints/${id}`, { method: "DELETE" }),
  toggleEndpoint: (id: number) =>
    req<any>(`/api/endpoints/${id}/toggle`, { method: "PATCH" }),
  getResults: (id: number, limit = 100) =>
    req<any[]>(`/api/endpoints/${id}/results?limit=${limit}`),

  // ----- deep inspect -----
  deepInspect: (url: string) =>
    req<any>(`/api/inspect/deep?url=${encodeURIComponent(url)}`),

  // ----- collections -----
  listCollections: () => req<any[]>("/api/collections"),
  createCollection: (name: string) =>
    req<any>("/api/collections", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  listSavedRequests: (cid: number) =>
    req<any[]>(`/api/collections/${cid}/requests`),
  saveRequest: (cid: number, body: any) =>
    req<any>(`/api/collections/${cid}/requests`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  sendSaved: (rid: number) =>
    req<any>(`/api/requests/${rid}/send`, { method: "POST" }),

  // ----- environments -----
  listEnvironments: () => req<any[]>("/api/environments"),
  createEnvironment: (name: string, variables: any) =>
    req<any>("/api/environments", {
      method: "POST",
      body: JSON.stringify({ name, variables }),
    }),
  activateEnvironment: (id: number) =>
    req<any>(`/api/environments/${id}/activate`, { method: "POST" }),

  // ----- stats / dashboard -----
  summary: () => req<any[]>("/api/stats/summary"),
  endpointStats: (id: number) => req<any>(`/api/stats/endpoints/${id}`),
  dailyUptime: (id: number, days = 30) =>
    req<any[]>(`/api/stats/endpoints/${id}/daily?days=${days}`),
  failures: (limit = 20) => req<any[]>(`/api/stats/failures?limit=${limit}`),

  // ----- system -----
  system: () => req<SystemStats>("/api/system/stats"),
};

export type SystemStats = {
  cpu_percent: number;
  cpu_count: number;
  cpu_per_core: number[];
  ram_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  disk_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
};
