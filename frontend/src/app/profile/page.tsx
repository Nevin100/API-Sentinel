"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="font-display text-3xl">Profile</h1>

      <div className="panel panel-pad mt-6">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#fef3e2] text-2xl font-semibold text-[#b45309]">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user.name}</p>
            <p className="truncate text-sm text-[#78716c]">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 border-t border-[#e7e0d5] pt-6 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[#a8a29e]">User ID</dt>
            <dd className="mono">#{user.id}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#a8a29e]">Email</dt>
            <dd className="truncate">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#a8a29e]">Member since</dt>
            <dd>{fmtDate(user.created_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="panel panel-pad mt-4">
        <h2 className="text-sm font-semibold">Session</h2>
        <p className="mt-1 text-sm text-[#78716c]">
          Signed in on this device. Logging out clears the token stored here.
        </p>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="btn-ghost mt-4"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
