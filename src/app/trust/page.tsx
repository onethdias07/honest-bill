import Link from "next/link";
import { Leaf, ShieldCheck, Database, GitBranch, Download, Server, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Trust & Data — HonestBill",
  description:
    "Who runs HonestBill, where your data lives, how it's secured, and how to get it out. Built to be verified, not trusted blindly.",
};

const repoUrl = process.env.FOUNDING_REPO_URL || "https://github.com/onethdias07/honest-bill";

export default function TrustPage() {
  const sections = [
    {
      icon: ShieldCheck,
      title: "Who operates HonestBill",
      body: "HonestBill is built and operated by OD Development, a small independent studio. There's a real person accountable for it — reach us by opening an issue on the public repo (or email hello@honestbill.app). No anonymous shell; the project, its history, and its maintainer are all public on GitHub.",
    },
    {
      icon: Database,
      title: "Where your data lives & how it's secured",
      body: "Data is stored in a managed PostgreSQL database (Neon), encrypted in transit (TLS). Neon runs automated, point-in-time backups. We don't sell data, run ad/tracking pixels, or share it with advertisers.",
    },
    {
      icon: GitBranch,
      title: "Open source — audit it or run it yourself",
      body: "The entire app is open source under AGPL-3.0. You can read every line, verify exactly how your data is handled, and — if you'd rather your data never leave your own servers — self-host it. There's no closed black box to trust.",
    },
    {
      icon: Download,
      title: "Your data can always leave",
      body: "One-click export of your whole workspace (clients, projects, time, expenses, invoices) as open JSON — anytime, no paywall. Try it below. Lock-in is the thing this product exists to prevent.",
    },
    {
      icon: Server,
      title: "Subprocessors",
      body: "Neon (database hosting), Vercel (application hosting), and PayPal (founding-member payments only). That's the full list.",
    },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="size-5 text-primary" />
            <span className="font-semibold tracking-tight">HonestBill</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Trust &amp; Data</h1>
        <p className="mt-3 text-muted-foreground">
          This is client data — invoices, rates, project details. You shouldn&apos;t
          trust any tool (including this one) blindly. Here&apos;s everything you
          need to verify HonestBill instead.
        </p>

        <div className="mt-10 flex flex-col gap-5">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex gap-4 rounded-xl border bg-card p-5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h2 className="font-medium">{s.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/api/export"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="size-4" /> Export all data (JSON)
          </a>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-input px-5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <GitBranch className="size-4" /> Read the source
          </a>
        </div>

        <div className="mt-10 flex gap-3 rounded-xl border border-warning/30 bg-warning/10 p-5 text-sm">
          <AlertTriangle className="size-5 shrink-0 text-warning" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Honest status:</span>{" "}
            HonestBill is early. The hosted app is currently single-workspace and
            multi-user authentication is still in progress — so <strong>don&apos;t
            put real client data into the hosted demo yet</strong>. If you need it
            today, self-host from the repo; otherwise reserve a founding spot and
            we&apos;ll tell you the moment it&apos;s production-ready.
          </p>
        </div>

        <footer className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          HonestBill by OD Development ·{" "}
          <Link href="/" className="hover:text-foreground">Home</Link> ·{" "}
          <a href={repoUrl} className="hover:text-foreground">GitHub (AGPL-3.0)</a>
        </footer>
      </main>
    </div>
  );
}
