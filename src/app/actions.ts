"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { amountForTime, dollarsToCents } from "@/lib/money";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createClient(formData: FormData) {
  const user = await getCurrentUser();
  const name = str(formData, "name");
  if (!name) return;
  await db.client.create({
    data: { name, email: str(formData, "email") || null, userId: user.id },
  });
  revalidatePath("/clients");
  revalidatePath("/projects");
}

export async function createProject(formData: FormData) {
  const user = await getCurrentUser();
  const name = str(formData, "name");
  const clientId = str(formData, "clientId");
  if (!name || !clientId) return;
  await db.project.create({
    data: {
      name,
      clientId,
      userId: user.id,
      rateCents: dollarsToCents(str(formData, "rate")),
    },
  });
  revalidatePath("/projects");
  revalidatePath("/time");
}

export async function logTime(formData: FormData) {
  const projectId = str(formData, "projectId");
  if (!projectId) return;

  let durationSeconds = parseInt(str(formData, "durationSeconds"), 10);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    const h = parseInt(str(formData, "hours"), 10) || 0;
    const m = parseInt(str(formData, "minutes"), 10) || 0;
    durationSeconds = h * 3600 + m * 60;
  }
  if (durationSeconds <= 0) return;

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  await db.timeEntry.create({
    data: {
      projectId,
      description: str(formData, "description"),
      durationSeconds,
      rateCents: project.rateCents,
    },
  });
  revalidatePath("/time");
  revalidatePath("/");
}

export async function deleteTimeEntry(formData: FormData) {
  const id = str(formData, "id");
  if (!id) return;
  // Only allow deleting entries that haven't been invoiced.
  await db.timeEntry.deleteMany({ where: { id, billed: false } });
  revalidatePath("/time");
  revalidatePath("/");
}

export async function createExpense(formData: FormData) {
  const projectId = str(formData, "projectId");
  const description = str(formData, "description");
  const amountCents = dollarsToCents(str(formData, "amount"));
  if (!projectId || !description || amountCents <= 0) return;
  await db.expense.create({ data: { projectId, description, amountCents } });
  revalidatePath("/time");
  revalidatePath("/");
}

export async function generateInvoice(formData: FormData) {
  const user = await getCurrentUser();
  const clientId = str(formData, "clientId");
  if (!clientId) return;

  const taxRatePct = parseFloat(str(formData, "taxRate")) || 0;
  const taxRateBps = Math.round(taxRatePct * 100);

  const projects = await db.project.findMany({
    where: { clientId, userId: user.id },
    select: { id: true },
  });
  const projectIds = projects.map((p) => p.id);
  if (projectIds.length === 0) return;

  const [entries, expenses] = await Promise.all([
    db.timeEntry.findMany({
      where: { projectId: { in: projectIds }, billed: false },
    }),
    db.expense.findMany({
      where: { projectId: { in: projectIds }, billed: false },
    }),
  ]);

  // Nothing unbilled — don't create an empty invoice.
  if (entries.length === 0 && expenses.length === 0) {
    redirect("/invoices?empty=1");
  }

  const timeTotal = entries.reduce(
    (s, e) => s + amountForTime(e.durationSeconds, e.rateCents),
    0
  );
  const expenseTotal = expenses.reduce((s, e) => s + e.amountCents, 0);
  const subtotalCents = timeTotal + expenseTotal;
  const taxCents = Math.round((subtotalCents * taxRateBps) / 10000);
  const totalCents = subtotalCents + taxCents;

  const count = await db.invoice.count({ where: { userId: user.id } });
  const number = `INV-${String(count + 1).padStart(4, "0")}`;
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 14);

  const invoice = await db.invoice.create({
    data: {
      number,
      status: "draft",
      clientId,
      userId: user.id,
      subtotalCents,
      taxRateBps,
      taxCents,
      totalCents,
      dueAt,
    },
  });

  await Promise.all([
    db.timeEntry.updateMany({
      where: { id: { in: entries.map((e) => e.id) } },
      data: { billed: true, invoiceId: invoice.id },
    }),
    db.expense.updateMany({
      where: { id: { in: expenses.map((e) => e.id) } },
      data: { billed: true, invoiceId: invoice.id },
    }),
  ]);

  revalidatePath("/invoices");
  revalidatePath("/");
  redirect(`/invoices/${invoice.id}`);
}

export async function setInvoiceStatus(formData: FormData) {
  const id = str(formData, "invoiceId");
  const status = str(formData, "status");
  if (!id || !["draft", "sent", "paid"].includes(status)) return;
  await db.invoice.update({
    where: { id },
    data: { status, paidAt: status === "paid" ? new Date() : null },
  });
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/");
}
