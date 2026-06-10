import { Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { logTime, createExpense, deleteTimeEntry } from "@/app/actions";
import { amountForTime, formatMoney, formatDuration } from "@/lib/money";
import { Timer } from "@/components/timer";
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

export const dynamic = "force-dynamic";

export default async function TimePage() {
  const user = await getCurrentUser();
  const projects = await db.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });
  const projectOptions = projects.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.client.name,
  }));

  const entries = await db.timeEntry.findMany({
    where: { project: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { project: { include: { client: true } } },
  });

  const hasProjects = projects.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Track time</h1>
        <p className="text-sm text-muted-foreground">
          Run a live timer or log time manually. Everything here can be turned
          into an invoice.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timer</CardTitle>
        </CardHeader>
        <CardContent>
          <Timer projects={projectOptions} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Log time manually</CardTitle>
            <CardDescription>Already did the work? Add it here.</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasProjects ? (
              <p className="text-sm text-muted-foreground">Add a project first.</p>
            ) : (
              <form action={logTime} className="grid gap-3">
                <Select name="projectId" required>
                  {projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.clientName} — {p.name}
                    </option>
                  ))}
                </Select>
                <Input name="description" placeholder="Description" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="hours">Hours</Label>
                    <Input id="hours" name="hours" type="number" min="0" placeholder="2" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="minutes">Minutes</Label>
                    <Input id="minutes" name="minutes" type="number" min="0" max="59" placeholder="30" />
                  </div>
                </div>
                <Button type="submit">Log time</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add a billable expense</CardTitle>
            <CardDescription>
              Pass-through costs (stock, subcontractor, travel).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasProjects ? (
              <p className="text-sm text-muted-foreground">Add a project first.</p>
            ) : (
              <form action={createExpense} className="grid gap-3">
                <Select name="projectId" required>
                  {projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.clientName} — {p.name}
                    </option>
                  ))}
                </Select>
                <Input name="description" placeholder="e.g. Stock photography" required />
                <div className="grid gap-1.5">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" name="amount" type="number" min="0" step="0.01" placeholder="45.00" required />
                </div>
                <Button type="submit" variant="secondary">
                  Add expense
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent entries</CardTitle>
          <CardDescription>Last {entries.length} time entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing logged yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
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
                    <TableCell>
                      {e.billed ? (
                        <Badge variant="muted">Billed</Badge>
                      ) : (
                        <Badge>Unbilled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!e.billed && (
                        <form action={deleteTimeEntry}>
                          <input type="hidden" name="id" value={e.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            aria-label="Delete entry"
                          >
                            <Trash2 className="text-muted-foreground" />
                          </Button>
                        </form>
                      )}
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
