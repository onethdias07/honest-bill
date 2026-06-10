import type { NormalizedImport } from "./import";

// Harvest API v2 import using the user's own Personal Access Token + Account ID
// (https://id.getharvest.com/developers). No gatekept OAuth partner approval.
//
// NOTE: implemented to the documented Harvest v2 shape and reuses the same
// applyImport pipeline as the (tested) CSV path. Verify end-to-end with a real
// token — it cannot be exercised without live Harvest credentials.
const BASE = "https://api.harvestapp.com/v2";

type HeaderMap = Record<string, string>;

async function fetchAllPages<T>(
  path: string,
  key: string,
  headers: HeaderMap
): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  for (;;) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`${BASE}${path}${sep}page=${page}&per_page=100`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Harvest API ${res.status}: ${await res.text()}`);
    }
    const json = (await res.json()) as Record<string, unknown> & {
      total_pages?: number;
    };
    const items = (json[key] as T[]) ?? [];
    out.push(...items);
    if (!json.total_pages || page >= json.total_pages) break;
    page++;
    if (page > 200) break; // hard safety stop
  }
  return out;
}

export async function fetchFromHarvest(
  accountId: string,
  token: string
): Promise<NormalizedImport> {
  const headers: HeaderMap = {
    Authorization: `Bearer ${token}`,
    "Harvest-Account-Id": accountId,
    "User-Agent": "HonestBill Importer (support@honestbill.app)",
  };

  type HClient = { name: string };
  type HProject = {
    name: string;
    client: { name: string };
    hourly_rate: number | null;
  };
  type HEntry = {
    spent_date: string;
    hours: number;
    notes: string | null;
    billable_rate: number | null;
    client: { name: string };
    project: { name: string };
  };

  const [hClients, hProjects, hEntries] = await Promise.all([
    fetchAllPages<HClient>("/clients", "clients", headers),
    fetchAllPages<HProject>("/projects", "projects", headers),
    fetchAllPages<HEntry>("/time_entries", "time_entries", headers),
  ]);

  return {
    clients: hClients
      .filter((c) => c.name)
      .map((c) => ({ name: c.name })),
    projects: hProjects
      .filter((p) => p.name && p.client?.name)
      .map((p) => ({
        name: p.name,
        clientName: p.client.name,
        rateCents: p.hourly_rate ? Math.round(p.hourly_rate * 100) : 0,
      })),
    timeEntries: hEntries
      .filter((e) => e.client?.name && e.project?.name)
      .map((e) => ({
        clientName: e.client.name,
        projectName: e.project.name,
        description: e.notes ?? "",
        durationSeconds: Math.round((e.hours ?? 0) * 3600),
        rateCents: e.billable_rate ? Math.round(e.billable_rate * 100) : 0,
        startedAt: e.spent_date
          ? new Date(e.spent_date).toISOString()
          : new Date().toISOString(),
      })),
  };
}
