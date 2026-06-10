import Link from "next/link";
import { ArrowRight, Clock, Send, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { amountForTime, formatMoney, formatDuration } from "@/lib/money";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const projects = await db.project.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  const pIds = projects.map((p) => p.id);

  const [unbilledEntries, unbilledExpenses, sentInvoices, recent] =
    await Promise.all([
      db.timeEntry.findMany({
        where: { projectId: { in: pIds }, billed: false },
      }),
      db.expense.findMany({
        where: { projectId: { in: pIds }, billed: false },
      }),
      db.invoice.findMany({ where: { userId: user.id, status: "sent" } }),
      db.timeEntry.findMany({
        where: { projectId: { in: pIds } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { project: { include: { client: true } } },
      }),
    ]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const paidInvoices = await db.invoice.findMany({
    where: { userId: user.id, status: "paid", paidAt: { gte: startOfMonth } },
  });

  const unbilledCents =
    unbilledEntries.reduce(
      (s, e) => s + amountForTime(e.durationSeconds, e.rateCents),
      0
    ) + unbilledExpenses.reduce((s, e) => s + e.amountCents, 0);
  const unbilledSeconds = unbilledEntries.reduce(
    (s, e) => s + e.durationSeconds,
    0
  );
  const awaitingCents = sentInvoices.reduce((s, i) => s + i.totalCents, 0);
  const paidThisMonthCents = paidInvoices.reduce((s, i) => s + i.totalCents, 0);

  const kpis = [
    {
      label: "Unbilled work",
      value: formatMoney(unbilledCents),
      hint: `${formatDuration(unbilledSeconds)} not yet invoiced`,
      icon: Clock,
    },
    {
      label: "Awaiting payment",
      value: formatMoney(awaitingCents),
      hint: `${sentInvoices.length} invoice(s) sent`,
      icon: Send,
    },
    {
      label: "Paid this month",
      value: formatMoney(paidThisMonthCents),
      hint: `${paidInvoices.length} invoice(s) paid`,
      icon: Wallet,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.name ?? "there"}.
          </p>
        </div>
        <Button asChild>
          <Link href="/time">
            <Clock /> Track time
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{k.label}</CardDescription>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {k.value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {unbilledCents > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium">
                You have {formatMoney(unbilledCents)} of unbilled work sitting on
                the table.
              </p>
              <p className="text-sm text-muted-foreground">
                Turn it into an invoice in a couple of clicks.
              </p>
            </div>
            <Button asChild>
              <Link href="/invoices">
                Create invoice <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Your latest time entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No time tracked yet.{" "}
              <Link href="/time" className="text-primary">
                Start your first timer
              </Link>
              .
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      {e.description || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.project.client.name} · {e.project.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatDuration(e.durationSeconds)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(amountForTime(e.durationSeconds, e.rateCents))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
