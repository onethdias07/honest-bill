import Link from "next/link";
import {
  Leaf,
  ShieldCheck,
  Lock,
  Download,
  GitBranch,
  HandCoins,
  Check,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayPalButton } from "@/components/paypal-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "HonestBill — Founding Lifetime Deal",
  description:
    "A flat-rate, open-source time-tracking & invoicing tool that can't surprise-bill you. Reserve a founding lifetime spot.",
};

const promises = [
  {
    icon: HandCoins,
    title: "No usage billing. Ever.",
    body: "Never charged per invoice, client, project, or task. One flat price — written into the charter.",
  },
  {
    icon: Lock,
    title: "Capped, predictable pricing.",
    body: "Any future increase is capped and announced 90 days ahead. Lifetime stays lifetime.",
  },
  {
    icon: Download,
    title: "Your data can always leave.",
    body: "One-click export of everything to open formats. No lock-in, no export paywall.",
  },
  {
    icon: GitBranch,
    title: "Open-source core, self-hostable.",
    body: "If we ever broke a promise, you could run it yourself. That option is the proof.",
  },
  {
    icon: ShieldCheck,
    title: "Acquisition-proof.",
    body: "If we're ever acquired, the charter transfers and the open core stays open.",
  },
];

const faqs = [
  {
    q: "Is the deposit really refundable?",
    a: "Yes — fully refundable any time before launch, for any reason. If I don't ship, everyone is refunded automatically.",
  },
  {
    q: "Why should I trust a solo founder not to do the same thing?",
    a: "Because the safeguards are structural, not promises. The core is open-source and self-hostable, your data exports in one click, and the pricing charter is public. If I ever broke them, you'd walk — which is exactly why I won't.",
  },
  {
    q: "What does the founding deal include?",
    a: "Lifetime access at the founding price, locked forever, plus direct input on the roadmap. The deposit is credited toward the one-time lifetime price at launch.",
  },
  {
    q: "What works today?",
    a: "Clients, projects, a live timer, expenses, and invoice generation. PDF export, sending, and online card payments are the next sprint — that's what your deposit funds.",
  },
];

export default function FoundingPage() {
  const depositUrl = process.env.FOUNDING_DEPOSIT_URL;
  const demoUrl = process.env.FOUNDING_DEMO_URL;
  const repoUrl = process.env.FOUNDING_REPO_URL || "#";
  const paypalClientId = process.env.PAYPAL_HOSTED_CLIENT_ID;
  const paypalButtonId = process.env.PAYPAL_HOSTED_BUTTON_ID;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Leaf className="size-5 text-primary" />
            <span className="font-semibold tracking-tight">HonestBill</span>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            See the live app →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6">
        {/* Hero */}
        <section className="py-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <ShieldCheck className="size-4" /> Founding offer — first 50 members
          </div>
          <h1 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Got hit by Harvest&apos;s repricing? Here&apos;s a tool that{" "}
            <span className="text-primary">legally can&apos;t</span> do that to
            you.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
            Flat-rate time tracking &amp; invoicing for freelancers and small
            agencies — with a binding pricing charter and an open-source core, so
            you&apos;re never held hostage by surprise usage fees again.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm font-medium">
              Lock founding lifetime pricing — $29 refundable deposit
            </p>
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
        </section>

        {/* Demo */}
        <section className="pb-16">
          <h2 className="mb-6 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
            See it working
          </h2>
          {demoUrl ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl border">
              <iframe
                src={demoUrl}
                allowFullScreen
                className="h-full w-full"
                title="HonestBill demo"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  {
                    src: "/demo/dashboard.png",
                    caption:
                      "Your dashboard — unbilled work, outstanding & paid at a glance",
                  },
                  {
                    src: "/demo/time.png",
                    caption: "Track time with a live timer",
                  },
                  {
                    src: "/demo/invoice.png",
                    caption: "One-click invoices from unbilled time & expenses",
                  },
                  {
                    src: "/demo/import.png",
                    caption: "Import your history from Harvest in minutes",
                  },
                ].map((shot) => (
                  <figure
                    key={shot.src}
                    className="overflow-hidden rounded-xl border bg-card"
                  >
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
                ))}
              </div>
              <figure className="overflow-hidden rounded-xl border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/demo/charter.png"
                  alt="The pricing charter, in writing"
                  className="w-full border-b"
                />
                <figcaption className="p-3 text-sm text-muted-foreground">
                  The pricing charter — in writing, not marketing
                </figcaption>
              </figure>
              <div className="text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                >
                  <Play className="size-4" /> Try the live demo
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Charter */}
        <section className="border-t py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              The Pricing Charter
            </h2>
            <p className="mt-2 text-muted-foreground">
              Five promises in writing — the reason this is safe to bet on.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {promises.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="flex gap-3 rounded-xl border bg-card p-5"
                >
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
              );
            })}
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/charter">Read the full charter</Link>
            </Button>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-t py-10">
          <div className="grid gap-4 text-sm sm:grid-cols-4">
            {[
              "Refundable any time",
              "Open-source core",
              "First 50 founding seats",
              "Cancel-free, no lock-in",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Check className="size-4 text-primary" /> {t}
              </div>
            ))}
          </div>
        </section>

        {/* Founder — TODO: personalize this with your real name, photo and story */}
        <section className="border-t py-16">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Who&apos;s building this</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              I&apos;m a solo developer who runs a small studio — and I got the
              same renewal shock you did. I&apos;m building HonestBill in the
              open so the safeguards aren&apos;t just words. Tell me what would
              make you trust it, and what would make you switch.
            </p>
            <div className="mt-4">
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                <GitBranch className="size-4" /> Follow the build (open-source
                repo)
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
          <div className="mt-6 flex flex-col divide-y">
            {faqs.map((f) => (
              <div key={f.q} className="py-4">
                <h3 className="font-medium">{f.q}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Lock your founding price.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Refundable, no risk — and you&apos;ll help shape the tool you wish
            Harvest still was.
          </p>
          <div className="mt-6 flex justify-center">
            {depositUrl ? (
              <Button asChild size="lg">
                <a href={depositUrl} target="_blank" rel="noopener noreferrer">
                  Reserve my founding spot — $29 refundable
                </a>
              </Button>
            ) : null}
          </div>
        </section>

        <footer className="border-t py-8 text-center text-xs text-muted-foreground">
          HonestBill · Flat pricing, in writing. ·{" "}
          <Link href="/charter" className="hover:text-foreground">
            The Charter
          </Link>
        </footer>
      </main>
    </div>
  );
}
