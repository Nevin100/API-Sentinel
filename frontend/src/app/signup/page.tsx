/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../lib/auth";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup(name.trim(), email.trim(), password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="landing grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#1c1917] text-[#faf7f1]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-[#1c1917]">
            API Sentinel
          </span>
        </Link>

        <div className="landing-card p-7">
          <h1 className="font-display text-2xl">Create your account</h1>
          <p className="mt-1 text-sm text-[#78716c]">
            Thirty seconds, then your first endpoint.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && <div className="error-box">{error}</div>}

            <div>
              <label className="label-light" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="input-light"
              />
            </div>

            <div>
              <label className="label-light" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-light"
              />
            </div>

            <div>
              <label className="label-light" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input-light"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-[#1c1917] py-2.5 text-sm font-medium text-[#faf7f1] hover:bg-[#44403c] disabled:opacity-60"
            >
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-[#78716c]">
          Already have one?{" "}
          <Link href="/login" className="font-medium text-[#b45309] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
