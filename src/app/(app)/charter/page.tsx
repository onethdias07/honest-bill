import { ShieldCheck, Lock, Download, GitBranch, HandCoins } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const promises = [
  {
    icon: HandCoins,
    title: "No usage-based billing. Ever.",
    body: "You will never be charged per invoice, per client, per project, or per task. One flat price for the whole workspace. The thing that just happened to you with another tool cannot happen here — it is written into this charter.",
  },
  {
    icon: Lock,
    title: "Capped, predictable price changes.",
    body: "If our price ever rises, existing customers are capped at a small annual increase and always get 90 days' notice. No overnight 10× renewal shocks. Lifetime-deal holders are never moved to a subscription.",
  },
  {
    icon: Download,
    title: "Your data is always free to leave with.",
    body: "One-click export of every client, project, time entry, expense, and invoice to open formats (CSV / JSON). No lock-in, no export paywall, no ransom. You can walk out the door any time — which is exactly why you won't need to.",
  },
  {
    icon: GitBranch,
    title: "An open-source core you can self-host.",
    body: "The core of HonestBill is open source. If we ever broke these promises, you could run it yourself or fork it. That option is the proof the promise is real — a venture-backed competitor can't offer it, because it removes their ability to squeeze you later.",
  },
  {
    icon: ShieldCheck,
    title: "An acquisition clause.",
    body: "If HonestBill is ever acquired, this charter transfers with it, and the open-source core stays open under its existing license. New owners inherit the promises — they don't get to delete them.",
  },
];

export default function CharterPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <ShieldCheck className="size-4" /> The Pricing Charter
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Billing software shouldn&apos;t hold your billing hostage.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Most time-tracking tools start cheap, build your whole cash-flow
          workflow around them, then reprice once you&apos;re locked in. We
          designed HonestBill so that can never happen — and we put the
          promises in writing, where you can hold us to them.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {promises.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title}>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="text-base">{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{p.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>Why we can make these promises and others can&apos;t</CardTitle>
          <CardDescription>The honest version.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            A venture-backed company has investors who eventually need
            outsized returns, which usually means raising prices on customers
            who can&apos;t easily leave. Offering an open-source, self-hostable
            core and a binding no-usage-billing charter would remove that lever
            — so they don&apos;t.
          </p>
          <p>
            HonestBill is built to be a durable, independent business that
            makes money by being trusted, not by trapping you. If that ever
            stops being true, the charter and the open core are your safety net.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
