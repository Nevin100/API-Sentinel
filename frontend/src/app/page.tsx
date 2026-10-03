import Link from "next/link";

function FeatureIcon({ path }: { path: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}

const FEATURES = [
  {
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
    title: "Uptime monitoring",
    body: "Add a URL, pick an interval. Sentinel checks it on schedule and keeps 30 days of uptime, p50/p95/p99 latency and a daily heatmap.",
  },
  {
    icon: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
    title: "Request tester",
    body: "A Postman-lite in your browser. Fire requests, inspect status, headers and timing, then replay anything from history.",
  },
  {
    icon: "M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.5 2.5M16.5 16.5 19 19M19 5l-2.5 2.5M7.5 16.5 5 19",
    title: "Deep Inspect",
    body: "Paste any URL for a full network X-ray — DNS, TCP, TLS and TTFB in a waterfall, so you see exactly where the milliseconds go.",
  },
  {
    icon: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
    title: "Discord alerts",
    body: "Three failed checks in a row and your server hears about it. One message per outage, one when it recovers — no spam.",
  },
  {
    icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
    title: "Collections & environments",
    body: "Group requests into collections. Swap {{base_url}} between dev, staging and prod with a single click.",
  },
  {
    icon: "M3 3v18h18M7 14l4-4 3 3 5-6",
    title: "Prometheus + Grafana",
    body: "Every check is a metric. Scraped by Prometheus, graphed in Grafana — the dashboards ship in the repo, ready to open.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Add your endpoints",
    body: "Paste the URLs that matter — health checks, webhooks, third-party APIs. Anything that answers HTTP.",
  },
  {
    n: "02",
    title: "Sentinel keeps watch",
    body: "Checks run on your schedule. Every result is logged, timed and turned into metrics.",
  },
  {
    n: "03",
    title: "Fix it before users notice",
    body: "Discord pings you the moment something breaks. Deep Inspect shows you exactly where.",
  },
];

export default function Landing() {
  return (
    <div className="landing min-h-screen">
      {/* ---------- nav ---------- */}
      <header className="border-b border-[#e7e0d5]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <span className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-[#1c1917] text-[#faf7f1]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">API Sentinel</span>
          </span>
          <nav className="hidden items-center gap-7 text-sm text-[#78716c] md:flex">
            <a href="#features" className="hover:text-[#1c1917]">Features</a>
            <a href="#how" className="hover:text-[#1c1917]">How it works</a>
            <a href="#stack" className="hover:text-[#1c1917]">Stack</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#78716c] hover:text-[#1c1917]">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#1c1917] px-4 py-2 text-sm font-medium text-[#faf7f1] hover:bg-[#44403c]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 md:px-8 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-5">Summer training project · BTech CSE &rsquo;27</p>
            <h1 className="font-display text-5xl leading-[1.05] md:text-6xl">
              Your APIs will go down.
              <br />
              <em className="text-[#b45309]">You&rsquo;ll know first.</em>
            </h1>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#57534e]">
              API Sentinel watches your endpoints around the clock, logs every
              request you fire, and X-rays slow responses down to the DNS
              lookup — then pings you on Discord before your users notice.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="rounded-lg bg-[#1c1917] px-6 py-3 text-[15px] font-medium text-[#faf7f1] hover:bg-[#44403c]"
              >
                Start monitoring
              </Link>
              <a
                href="#how"
                className="rounded-lg border border-[#e7e0d5] px-6 py-3 text-[15px] font-medium hover:border-[#a8a29e]"
              >
                How it works
              </a>
            </div>
            <p className="mt-4 text-[13px] text-[#a8a29e]">
              Free forever. Runs on your own machine with Docker.
            </p>
          </div>

          {/* terminal mock */}
          <div className="overflow-hidden rounded-2xl border border-[#292524] bg-[#101013] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#57534e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#57534e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#57534e]" />
              <span className="mono ml-2 text-xs text-zinc-500">sentinel — live checks</span>
            </div>
            <div className="mono space-y-2.5 p-5 text-[13px] leading-relaxed">
              <p className="text-zinc-500">$ sentinel watch --all</p>
              <p><span className="text-emerald-400">✓</span> <span className="text-zinc-200">payments/health</span> <span className="text-zinc-500">200 in 184ms · dns 12ms · tls 61ms</span></p>
              <p><span className="text-emerald-400">✓</span> <span className="text-zinc-200">auth/login</span> <span className="text-zinc-500">200 in 171ms · dns 9ms · tls 58ms</span></p>
              <p><span className="text-red-400">✗</span> <span className="text-zinc-200">webhooks/stripe</span> <span className="text-zinc-500">timeout after 10s · retry 2/3</span></p>
              <p><span className="text-red-400">✗</span> <span className="text-zinc-200">webhooks/stripe</span> <span className="text-zinc-500">timeout after 10s · retry 3/3</span></p>
              <p className="border-t border-white/10 pt-2.5 text-amber-300">→ Discord alert sent to #incidents</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section id="features" className="border-y border-[#e7e0d5] bg-[#f5f0e8]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
          <p className="eyebrow mb-4">What it does</p>
          <h2 className="font-display max-w-xl text-3xl leading-tight md:text-4xl">
            Everything around your APIs, in one place.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="landing-card p-6">
                <span className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-[#fef3e2] text-[#b45309]">
                  <FeatureIcon path={f.icon} />
                </span>
                <h3 className="mb-1.5 text-[15px] font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#78716c]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
        <p className="eyebrow mb-4">How it works</p>
        <h2 className="font-display max-w-xl text-3xl leading-tight md:text-4xl">
          Three steps between you and 3&nbsp;a.m. firefighting.
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t-2 border-[#1c1917] pt-5">
              <p className="mono text-sm text-[#b45309]">{s.n}</p>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#78716c]">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- stack ---------- */}
      <section id="stack" className="border-y border-[#e7e0d5]">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <p className="eyebrow mb-5">Built with</p>
          <p className="mono flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#57534e]">
            {["FastAPI", "Next.js", "PostgreSQL", "Redis", "Docker", "Prometheus", "Grafana"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </p>
        </div>
      </section>

      {/* ---------- cta ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="landing-card px-6 py-14 text-center md:py-20">
          <h2 className="font-display mx-auto max-w-2xl text-4xl leading-tight md:text-5xl">
            Break something. <em className="text-[#b45309]">We&rsquo;ll catch it.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-[#78716c]">
            Create an account, add your first endpoint, and watch the checks roll in.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-lg bg-[#1c1917] px-8 py-3.5 text-[15px] font-medium text-[#faf7f1] hover:bg-[#44403c]"
          >
            Get started — it&rsquo;s free
          </Link>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-[#e7e0d5]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-[#a8a29e] md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            <span className="font-medium text-[#57534e]">API Sentinel</span> — a summer
            training project by Nevin Bali (08615002723) & Ayush Tomer (10715002723).
          </p>
          <p className="flex gap-5">
            <a href="https://github.com/Nevin100" className="hover:text-[#1c1917]">GitHub</a>
            <Link href="/login" className="hover:text-[#1c1917]">Log in</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
