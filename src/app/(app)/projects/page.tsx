import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createProject } from "@/app/actions";
import { formatMoney } from "@/lib/money";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  const [clients, projects] = await Promise.all([
    db.client.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    db.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        _count: { select: { timeEntries: true } },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Each project has an hourly rate. Time you log inherits that rate.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a project</CardTitle>
        </CardHeader>
        <CardContent>
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
              action={createProject}
              className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto_auto]"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="name">Project name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Website Redesign"
                  required
                />
              </div>
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
                <Label htmlFor="rate">Rate / hr ($)</Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="100"
                  className="w-28"
                />
              </div>
              <Button type="submit">Add project</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All projects</CardTitle>
          <CardDescription>{projects.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No projects yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Rate / hr</TableHead>
                  <TableHead className="text-right">Entries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.client.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(p.rateCents)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p._count.timeEntries}
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
