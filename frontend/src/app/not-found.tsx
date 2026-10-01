import Link from "next/link";

export default function NotFound() {
  return (
    <div className="landing">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow mb-4">404</p>
        <h1 className="font-display text-5xl md:text-6xl">
          This page went down.
        </h1>
        <p className="mt-4 max-w-md text-[#78716c]">
          Aur Sentinel ne isse catch bhi nahi kiya — kyunki ye page kabhi tha
          hi nahi. Galat URL lagta hai.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/dashboard" className="btn-primary">
            Back to dashboard
          </Link>
          <Link href="/" className="btn-ghost">
            Landing page
          </Link>
        </div>
        <p className="mono mt-10 text-xs text-[#a8a29e]">
          status: 404 · latency: 0ms · error: page_not_found
        </p>
      </div>
    </div>
  );
}
    