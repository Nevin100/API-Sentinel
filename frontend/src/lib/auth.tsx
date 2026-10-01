"use client";

import { createContext, useContext, useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string | null;
};

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

async function parseErr(res: Response): Promise<string> {
  try {
    const j = await res.json();
    return j.detail || "Something went wrong";
  } catch {
    return `Request failed (${res.status})`;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("sentinel_token");
    if (!t) {
      setLoading(false);
      return;
    }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error("bad token");
        const u = await r.json();
        setUser(u);
        setToken(t);
      })
      .catch(() => localStorage.removeItem("sentinel_token"))
      .finally(() => setLoading(false));
  }, []);

  async function signup(name: string, email: string, password: string) {
    const r = await fetch(`${BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!r.ok) throw new Error(await parseErr(r));
    const data = await r.json();
    localStorage.setItem("sentinel_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function login(email: string, password: string) {
    const r = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error(await parseErr(r));
    const data = await r.json();
    localStorage.setItem("sentinel_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("sentinel_token");
    setToken(null);
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
