import Papa from "papaparse";
import type { NormalizedImport } from "./import";

// Read a value by trying several possible header names (case-insensitive).
function field(row: Record<string, string>, candidates: string[]): string {
  for (const k of Object.keys(row)) {
    if (candidates.includes(k.trim().toLowerCase())) {
      return (row[k] ?? "").trim();
    }
  }
  return "";
}

function toHours(v: string): number {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function toRateCents(v: string): number {
  if (!v) return 0;
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function toIsoDate(v: string): string {
  if (!v) return new Date().toISOString();
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  const m = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const d2 = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
    if (!Number.isNaN(d2.getTime())) return d2.toISOString();
  }
  return new Date().toISOString();
}

// Parses a Harvest "Detailed Time Report" CSV export (and similar). Tolerant of
// header-name and date-format variations.
export function parseHarvestCsv(text: string): NormalizedImport {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  const rows = (parsed.data ?? []) as Record<string, string>[];

  const clients = new Map<string, { name: string }>();
  const projects = new Map<
    string,
    { name: string; clientName: string; rateCents: number }
  >();
  const timeEntries: NormalizedImport["timeEntries"] = [];

  for (const row of rows) {
    const clientName = field(row, ["client"]);
    const projectName = field(row, ["project"]);
    if (!clientName || !projectName) continue;

    const description =
      field(row, ["notes", "note"]) || field(row, ["task"]) || "";
    const rateCents = toRateCents(
      field(row, ["billable rate", "hourly rate", "rate"])
    );
    const startedAt = toIsoDate(field(row, ["date", "spent date", "spent_date"]));
    const durationSeconds = Math.round(toHours(field(row, ["hours", "hour"])) * 3600);

    const ckey = clientName.toLowerCase();
    if (!clients.has(ckey)) clients.set(ckey, { name: clientName });

    const pkey = `${ckey}::${projectName.toLowerCase()}`;
    const existing = projects.get(pkey);
    if (!existing) {
      projects.set(pkey, { name: projectName, clientName, rateCents });
    } else if (rateCents && !existing.rateCents) {
      existing.rateCents = rateCents;
    }

    if (durationSeconds <= 0) continue;
    timeEntries.push({
      clientName,
      projectName,
      description,
      durationSeconds,
      rateCents,
      startedAt,
    });
  }

  return {
    clients: [...clients.values()],
    projects: [...projects.values()],
    timeEntries,
  };
}
