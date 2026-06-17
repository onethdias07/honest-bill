import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

// One-click data export — makes the Pricing Charter's "your data can always
// leave" promise real and verifiable. Returns the whole workspace as JSON.
export async function GET() {
  const user = await getCurrentUser();

  const [clients, projects, timeEntries, expenses, invoices] = await Promise.all([
    db.client.findMany({ where: { userId: user.id } }),
    db.project.findMany({ where: { userId: user.id } }),
    db.timeEntry.findMany({ where: { project: { userId: user.id } } }),
    db.expense.findMany({ where: { project: { userId: user.id } } }),
    db.invoice.findMany({
      where: { userId: user.id },
      include: { timeEntries: true, expenses: true },
    }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    workspace: { id: user.id, name: user.name, email: user.email },
    clients,
    projects,
    timeEntries,
    expenses,
    invoices,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": 'attachment; filename="honestbill-export.json"',
    },
  });
}
