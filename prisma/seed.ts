import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

try {
  process.loadEnvFile();
} catch {
  /* fall back to default url below */
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

function hours(n: number) {
  return Math.round(n * 3600);
}

async function main() {
  // Idempotent: clear in FK-safe order, then recreate.
  await db.timeEntry.deleteMany();
  await db.expense.deleteMany();
  await db.invoice.deleteMany();
  await db.project.deleteMany();
  await db.client.deleteMany();
  await db.user.deleteMany();

  const user = await db.user.create({
    data: { email: "demo@honestbill.app", name: "Demo Studio" },
  });

  const acme = await db.client.create({
    data: { name: "Acme Co.", email: "ap@acme.com", userId: user.id },
  });
  const bloom = await db.client.create({
    data: { name: "Bloom Bakery", email: "owner@bloom.co", userId: user.id },
  });

  const redesign = await db.project.create({
    data: { name: "Website Redesign", rateCents: 12000, clientId: acme.id, userId: user.id },
  });
  const retainer = await db.project.create({
    data: { name: "Monthly Retainer", rateCents: 9000, clientId: acme.id, userId: user.id },
  });
  const brand = await db.project.create({
    data: { name: "Brand Identity", rateCents: 8500, clientId: bloom.id, userId: user.id },
  });

  // Unbilled time — gives "Generate invoice" something to do in-app.
  await db.timeEntry.createMany({
    data: [
      { description: "Homepage wireframes", durationSeconds: hours(3.5), rateCents: 12000, projectId: redesign.id },
      { description: "Design review call", durationSeconds: hours(1), rateCents: 12000, projectId: redesign.id },
      { description: "Component build", durationSeconds: hours(4.25), rateCents: 12000, projectId: redesign.id },
      { description: "Content updates", durationSeconds: hours(2), rateCents: 9000, projectId: retainer.id },
      { description: "Logo concepts", durationSeconds: hours(5), rateCents: 8500, projectId: brand.id },
    ],
  });

  await db.expense.create({
    data: { description: "Stock photography", amountCents: 4500, projectId: redesign.id },
  });

  // One already-paid invoice so the dashboard KPIs show real numbers.
  const billedSeconds = hours(6);
  const subtotal = Math.round((billedSeconds / 3600) * 8500); // 6h @ $85
  const tax = 0;
  const invoice = await db.invoice.create({
    data: {
      number: "INV-0001",
      status: "paid",
      clientId: bloom.id,
      userId: user.id,
      subtotalCents: subtotal,
      taxRateBps: 0,
      taxCents: tax,
      totalCents: subtotal + tax,
      paidAt: new Date(),
    },
  });
  await db.timeEntry.create({
    data: {
      description: "Brand workshop (billed)",
      durationSeconds: billedSeconds,
      rateCents: 8500,
      projectId: brand.id,
      billed: true,
      invoiceId: invoice.id,
    },
  });

  const counts = {
    users: await db.user.count(),
    clients: await db.client.count(),
    projects: await db.project.count(),
    timeEntries: await db.timeEntry.count(),
    invoices: await db.invoice.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
