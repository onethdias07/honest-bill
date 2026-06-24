import Link from "next/link";
import {
  Leaf,
  ShieldCheck,
  Lock,
  Download,
  GitBranch,
  HandCoins,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayPalButton } from "@/components/paypal-button";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "HonestBill — flat-rate time tracking & invoicing that can't surprise-bill you",
  description:
    "A flat-rate, founder-owned, open-source time-tracking & invoicing tool for freelancers and small agencies — with a binding pricing charter. Reserve a founding lifetime spot.",
};

const promises = [
  {
    icon: HandCoins,
    title: "No usage billing. Ever.",
    body: "Never charged per invoice, client, project, or task. One flat price per workspace — written into the charter.",
  },
  {
    icon: Lock,
    title: "Capped, predictable pricing.",
    body: "Any future increase is capped, with 90 days' notice. No overnight 10× renewal shocks. Lifetime stays lifetime.",
  },
  {
    icon: Download,
    title: "Your data can always leave.",
    body: "One-click export of everything to open formats. No lock-in, no export paywall, no ransom.",
  },
  {
    icon: GitBranch,
    title: "Open-source core, self-hostable.",
    body: "The core is on GitHub. If we ever broke a promise, you could run it yourself — that option is the proof.",
  },
  {
    icon: ShieldCheck,
    title: "Acquisition-proof.",
    body: "If we're ever acquired, the charter transfers and the open core stays open. New owners inherit the promises.",
  },
];

const features = [
  {
    src: "/demo/dashboard.png",
    caption: "Your dashboard — unbilled work, outstanding & paid at a glance",
  },
  { src: "/demo/time.png", caption: "Track time with a live timer" },
  {
    src: "/demo/invoice.png",
    caption: "One-click invoices from unbilled time & expenses",
  },
  {
    src: "/demo/import.png",
    caption: "Import your history from Harvest in minutes",
  },
];

const faqs = [
  {
    q: "Is the deposit really refundable?",
    a: "Yes — fully refundable any time before launch, for any reason. If we don't ship, everyone is refunded automatically.",
  },
  {
    q: "Why should I trust a small studio not to do the same thing?",
    a: "Because the safeguards are structural, not promises. The core is open-source and self-hostable, your data exports in one click, and the pricing charter is public. If we ever broke them, you'd walk — which is exactly why we won't.",
  },
  {
    q: "What does the founding deal include?",
    a: "Lifetime access at the founding price, locked forever, plus direct input on the roadmap. The $29 deposit is credited toward the one-time lifetime price at launch.",
  },
  {
    q: "What works today?",
    a: "Clients, projects, a live timer, expenses, and invoice generation — try the live demo. PDF export, sending, and online card payments are the next sprint; that's what your deposit funds.",
  },
];

export default function LandingPage() {
  const depositUrl = process.env.FOUNDING_DEPOSIT_URL;
  const paypalClientId = process.env.PAYPAL_HOSTED_CLIENT_ID;
  const paypalButtonId = process.env.PAYPAL_HOSTED_BUTTON_ID;
  const repoUrl =
    process.env.FOUNDING_REPO_URL || "https://github.com/onethdias07/honest-bill";

  const total = 50;
  // Real founding-deposit count. Bump this number (and push) as deposits land —
  // or override it with the FOUNDING_CLAIMED env var in Vercel.
  const claimed = Math.max(
    0,
    Math.min(total, parseInt(process.env.FOUNDING_CLAIMED ?? "2", 10) || 0)
  );
  const remaining = total - claimed;
  const pct = Math.round((claimed / total) * 100);

  const spots = (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>Founding members</span>
        <span>
          {remaining > 0 ? `${remaining} of ${total} spots left` : "Fully booked"}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Leaf className="size-5 text-primary" />
            <span className="font-semibold tracking-tight">HonestBill</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/dashboard"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Live demo
            </Link>
            <Button asChild size="sm">
              <Link href="#reserve">Reserve your spot</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section className="py-16 text-center sm:py-24">
          <Reveal>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <ShieldCheck className="size-4" /> Founding offer — first 50 members
            </div>
            <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Billing software that{" "}
              <span className="text-primary">can&apos;t</span> surprise-bill you.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
              Flat-rate time tracking &amp; invoicing for freelancers and small
              agencies — with a binding pricing charter and an open-source core,
              so you&apos;re never held hostage by surprise usage fees again.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8 flex flex-col items-center gap-4">
              {spots}
              <PayPalButton
                clientId={paypalClientId}
                hostedButtonId={paypalButtonId}
                fallbackUrl={depositUrl}
                label="Reserve my founding spot — $29 refundable"
              />
              <p className="text-sm text-muted-foreground">
                $29 deposit, credited toward $199 lifetime. Fully refundable any
                time before launch.
              </p>
            </div>
          </Reveal>
        </section>

        {/* Trust strip */}
        <Reveal>
          <section className="grid gap-4 border-y py-8 text-sm sm:grid-cols-4">
            {[
              "Refundable any time",
              "Open-source core",
              "First 50 founding seats",
              "No lock-in, ever",
            ].map((t) => (
              <div key={t} className="flex items-center justify-center gap-2">
                <Check className="size-4 text-primary" /> {t}
              </div>
            ))}
          </section>
        </Reveal>

        {/* Demo */}
        <section className="py-16">
          <Reveal>
            <h2 className="mb-2 text-center text-2xl font-semibold tracking-tight">
              See it working
            </h2>
            <p className="mb-8 text-center text-muted-foreground">
              The real product — or{" "}
              <Link href="/dashboard" className="text-primary">
                try the live demo
              </Link>
              .
            </p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((shot, i) => (
              <Reveal key={shot.src} delay={i * 80}>
                <figure className="overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.src}
                    alt={shot.caption}
                    className="w-full border-b"
                  />
                  <figcaption className="p-3 text-sm text-muted-foreground">
                    {shot.caption}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Charter */}
        <section className="border-t py-16">
          <Reveal>
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                The Pricing Charter
              </h2>
              <p className="mt-2 text-muted-foreground">
                Five promises in writing — the reason this is safe to bet on.
              </p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {promises.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 70}>
                  <div className="flex h-full gap-3 rounded-xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-medium">{p.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {p.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Why we can promise this */}
        <Reveal>
          <section className="border-t py-16">
            <div className="rounded-xl border bg-primary/5 p-6 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight">
                Why we can make these promises and others can&apos;t
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                A venture-backed company has investors who eventually need
                outsized returns — which usually means raising prices on
                customers who can&apos;t easily leave. An open-source,
                self-hostable core and a binding no-usage-billing charter would
                remove that lever, so they don&apos;t offer it. HonestBill is
                built to make money by being trusted, not by trapping you. If
                that ever stops being true, the charter and the open core are
                your safety net.
              </p>
            </div>
          </section>
        </Reveal>

        {/* Founder — OD Development */}
        <Reveal>
          <section className="border-t py-16">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold">Who&apos;s building this</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                HonestBill is built by <strong>OD Development</strong>, a small
                independent studio. We got the same renewal shock you did — so
                we&apos;re building it in the open, with the safeguards written
                down rather than promised. Tell us what would make you trust it,
                and what would make you switch.
              </p>
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                <GitBranch className="size-4" /> Follow the build (open-source
                repo)
              </a>
            </div>
          </section>
        </Reveal>

        {/* FAQ */}
        <section className="border-t py-16">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
          </Reveal>
          <div className="mt-6 flex flex-col divide-y">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <div className="py-4">
                  <h3 className="font-medium">{f.q}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <Reveal>
          <section id="reserve" className="scroll-mt-20 border-t py-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Lock your founding price.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Refundable, no risk — and you&apos;ll help shape the tool you wish
              your old one still was.
            </p>
            <div className="mt-6 flex flex-col items-center gap-4">
              {spots}
              {depositUrl ? (
                <Button asChild size="lg">
                  <a href={depositUrl} target="_blank" rel="noopener noreferrer">
                    Reserve my founding spot — $29 refundable <ArrowRight />
                  </a>
                </Button>
              ) : null}
            </div>
          </section>
        </Reveal>

        <footer className="border-t py-8 text-center text-xs text-muted-foreground">
          HonestBill by OD Development · Flat pricing, in writing. ·{" "}
          <Link href="/dashboard" className="hover:text-foreground">
            Live demo
          </Link>{" "}
          ·{" "}
          <Link href="/trust" className="hover:text-foreground">
            Trust &amp; data
          </Link>{" "}
          ·{" "}
          <a href={repoUrl} className="hover:text-foreground">
            GitHub
          </a>
        </footer>
      </main>
    </div>
  );
}
