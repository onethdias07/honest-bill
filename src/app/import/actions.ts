"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { applyImport, type ImportSummary } from "@/lib/import";
import { parseHarvestCsv } from "@/lib/harvest-csv";
import { fetchFromHarvest } from "@/lib/harvest-api";

type Result = ImportSummary & { error?: string };

function revalidate() {
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath("/projects");
  revalidatePath("/time");
  revalidatePath("/invoices");
}

export async function importCsv(text: string, dryRun: boolean): Promise<Result> {
  const user = await getCurrentUser();
  try {
    if (!text.trim()) throw new Error("No CSV content provided.");
    const data = parseHarvestCsv(text);
    const summary = await applyImport(user.id, data, { dryRun });
    if (!dryRun) revalidate();
    return summary;
  } catch (e) {
    return {
      clientsCreated: 0,
      projectsCreated: 0,
      timeEntriesCreated: 0,
      timeEntriesSkipped: 0,
      totalSeconds: 0,
      totalCents: 0,
      dryRun,
      error: e instanceof Error ? e.message : "CSV import failed.",
    };
  }
}

export async function importHarvestApi(
  accountId: string,
  token: string,
  dryRun: boolean
): Promise<Result> {
  const user = await getCurrentUser();
  try {
    if (!accountId.trim() || !token.trim()) {
      throw new Error("Account ID and Personal Access Token are both required.");
    }
    const data = await fetchFromHarvest(accountId.trim(), token.trim());
    const summary = await applyImport(user.id, data, { dryRun });
    if (!dryRun) revalidate();
    return summary;
  } catch (e) {
    return {
      clientsCreated: 0,
      projectsCreated: 0,
      timeEntriesCreated: 0,
      timeEntriesSkipped: 0,
      totalSeconds: 0,
      totalCents: 0,
      dryRun,
      error: e instanceof Error ? e.message : "Harvest API import failed.",
    };
  }
}
