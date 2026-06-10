import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Download, Send } from "lucide-react";
import { db } from "@/lib/db";
import { setInvoiceStatus } from "@/app/actions";
import { amountForTime, formatMoney, formatDuration } from "@/lib/money";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function statusBadge(status: string) {
  if (status === "paid") return <Badge variant="success">Paid</Badge>;
  if (status === "sent") return <Badge variant="warning">Sent</Badge>;
  return <Badge variant="muted">Draft</Badge>;
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      timeEntries: { include: { project: true } },
      expenses: { include: { project: true } },
    },
  });

  if (!invoice) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All invoices
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {invoice.number}
            </h1>
            {statusBadge(invoice.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            {invoice.client.name}
            {invoice.client.email ? ` · ${invoice.client.email}` : ""}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Issued {format(invoice.issuedAt, "d MMM yyyy")}
            {invoice.dueAt ? ` · Due ${format(invoice.dueAt, "d MMM yyyy")}` : ""}
            {invoice.paidAt
              ? ` · Paid ${format(invoice.paidAt, "d MMM yyyy")}`
              : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {invoice.status === "draft" && (
            <form action={setInvoiceStatus}>
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <input type="hidden" name="status" value="sent" />
              <Button type="submit">
                <Send /> Mark as sent
              </Button>
            </form>
          )}
          {invoice.status === "sent" && (
            <form action={setInvoiceStatus}>
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <input type="hidden" name="status" value="paid" />
              <Button type="submit">Mark as paid</Button>
            </form>
          )}
          {invoice.status !== "draft" && (
            <form action={setInvoiceStatus}>
              <input type="hidden" name="invoiceId" value={invoice.id} />
              <input type="hidden" name="status" value="draft" />
              <Button type="submit" variant="outline">
                Revert to draft
              </Button>
            </form>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.timeEntries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    {e.description || "Time"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.project.name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDuration(e.durationSeconds)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(e.rateCents)}/hr
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(amountForTime(e.durationSeconds, e.rateCents))}
                  </TableCell>
                </TableRow>
              ))}
              {invoice.expenses.map((x) => (
                <TableRow key={x.id}>
                  <TableCell className="font-medium">{x.description}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {x.project.name} (expense)
                  </TableCell>
                  <TableCell className="text-right tabular-nums">1</TableCell>
                  <TableCell className="text-right tabular-nums">—</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(x.amountCents)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">
                {formatMoney(invoice.subtotalCents)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tax ({(invoice.taxRateBps / 100).toFixed(1)}%)
              </span>
              <span className="tabular-nums">
                {formatMoney(invoice.taxCents)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums">
                {formatMoney(invoice.totalCents)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/40">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm text-muted-foreground">
            PDF export and one-click Stripe payment links land in the next
            version (see the roadmap in the README).
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Download /> PDF (soon)
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Send /> Payment link (soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
