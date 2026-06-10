import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { generateInvoice } from "@/app/actions";
import { formatMoney } from "@/lib/money";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ empty?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const [clients, invoices] = await Promise.all([
    db.client.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    db.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Generate an invoice from all unbilled time &amp; expenses for a client.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate invoice</CardTitle>
          <CardDescription>
            Pulls every unbilled entry for the selected client and marks it
            billed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sp.empty && (
            <p className="mb-3 rounded-md bg-warning/15 px-3 py-2 text-sm text-warning">
              That client has no unbilled time or expenses to invoice.
            </p>
          )}
          {clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add a{" "}
              <Link href="/clients" className="text-primary">
                client
              </Link>{" "}
              first.
            </p>
          ) : (
            <form
              action={generateInvoice}
              className="grid items-end gap-3 sm:grid-cols-[1fr_auto_auto]"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="clientId">Client</Label>
                <Select id="clientId" name="clientId" required>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="taxRate">Tax %</Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue="0"
                  className="w-24"
                />
              </div>
              <Button type="submit">Generate</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All invoices</CardTitle>
          <CardDescription>{invoices.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No invoices yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.number}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {inv.client.name}
                    </TableCell>
                    <TableCell>{statusBadge(inv.status)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(inv.totalCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/invoices/${inv.id}`}>View</Link>
                      </Button>
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
