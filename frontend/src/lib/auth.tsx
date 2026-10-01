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
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({
  user: null,
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
  const [loading, setLoading] = useState(true);

  // Session restore — cookie (httpOnly) browser khud bhejega
  useEffect(() => {
    fetch(`${BASE}/auth/me`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error("no session");
        setUser(await r.json());
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function signup(name: string, email: string, password: string) {
    const r = await fetch(`${BASE}/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!r.ok) throw new Error(await parseErr(r));
    const data = await r.json();
    setUser(data.user);
  }

  async function login(email: string, password: string) {
    const r = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error(await parseErr(r));
    const data = await r.json();
    setUser(data.user);
  }

  async function logout() {
    try {
      await fetch(`${BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* backend down ho toh bhi local session saaf */
    }
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
