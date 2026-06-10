import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const user = await getCurrentUser();
  const clients = await db.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { projects: true, invoices: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="text-sm text-muted-foreground">
          The people you bill. Projects and invoices hang off these.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a client</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={createClient}
            className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Acme Co." required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Billing email (optional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ap@acme.com"
              />
            </div>
            <Button type="submit">Add client</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All clients</CardTitle>
          <CardDescription>{clients.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No clients yet — add one above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Projects</TableHead>
                  <TableHead className="text-right">Invoices</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c._count.projects}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c._count.invoices}
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
