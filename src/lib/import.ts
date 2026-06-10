import { db } from "./db";
import { amountForTime } from "./money";

// Normalized shape that every import source (CSV, Harvest API, ...) maps into.
export type NormalizedImport = {
  clients: { name: string; email?: string | null }[];
  projects: { name: string; clientName: string; rateCents: number }[];
  timeEntries: {
    clientName: string;
    projectName: string;
    description: string;
    durationSeconds: number;
    rateCents: number;
    startedAt: string; // ISO
  }[];
};

export type ImportSummary = {
  clientsCreated: number;
  projectsCreated: number;
  timeEntriesCreated: number;
  timeEntriesSkipped: number;
  totalSeconds: number;
  totalCents: number;
  dryRun: boolean;
};

function entrySig(
  projectKey: string,
  description: string,
  durationSeconds: number,
  startedAtIso: string
) {
  return `${projectKey}|${description}|${durationSeconds}|${startedAtIso.slice(0, 10)}`;
}

// Idempotent: clients/projects are matched by name (case-insensitive), time
// entries are de-duplicated by a content signature so re-importing is safe.
// dryRun computes what *would* happen without writing anything.
export async function applyImport(
  userId: string,
  data: NormalizedImport,
  opts: { dryRun?: boolean } = {}
): Promise<ImportSummary> {
  const dryRun = !!opts.dryRun;

  const existingClients = await db.client.findMany({
    where: { userId },
    select: { id: true, name: true },
  });
  const clientIdByName = new Map<string, string>(
    existingClients.map((c) => [c.name.toLowerCase(), c.id])
  );

  let clientsCreated = 0;
  for (const c of data.clients) {
    const key = c.name.trim().toLowerCase();
    if (!key || clientIdByName.has(key)) continue;
    if (dryRun) {
      clientIdByName.set(key, "dry");
      clientsCreated++;
      continue;
    }
    const created = await db.client.create({
      data: { name: c.name.trim(), email: c.email ?? null, userId },
    });
    clientIdByName.set(key, created.id);
    clientsCreated++;
  }

  const existingProjects = await db.project.findMany({
    where: { userId },
    select: { id: true, name: true, client: { select: { name: true } } },
  });
  const projectIdByKey = new Map<string, string>(
    existingProjects.map((p) => [
      `${p.client.name.toLowerCase()}::${p.name.toLowerCase()}`,
      p.id,
    ])
  );

  let projectsCreated = 0;
  for (const p of data.projects) {
    const ckey = p.clientName.trim().toLowerCase();
    const pkey = `${ckey}::${p.name.trim().toLowerCase()}`;
    if (!p.name.trim() || projectIdByKey.has(pkey)) continue;
    const clientId = clientIdByName.get(ckey);
    if (!clientId) continue;
    if (dryRun) {
      projectIdByKey.set(pkey, "dry");
      projectsCreated++;
      continue;
    }
    const created = await db.project.create({
      data: { name: p.name.trim(), clientId, userId, rateCents: p.rateCents || 0 },
    });
    projectIdByKey.set(pkey, created.id);
    projectsCreated++;
  }

  const existingEntries = await db.timeEntry.findMany({
    where: { project: { userId } },
    select: {
      description: true,
      durationSeconds: true,
      startedAt: true,
      project: { select: { name: true, client: { select: { name: true } } } },
    },
  });
  const seen = new Set(
    existingEntries.map((e) =>
      entrySig(
        `${e.project.client.name.toLowerCase()}::${e.project.name.toLowerCase()}`,
        e.description,
        e.durationSeconds,
        e.startedAt.toISOString()
      )
    )
  );

  let timeEntriesCreated = 0;
  let timeEntriesSkipped = 0;
  let totalSeconds = 0;
  let totalCents = 0;

  for (const t of data.timeEntries) {
    const ckey = t.clientName.trim().toLowerCase();
    const pkey = `${ckey}::${t.projectName.trim().toLowerCase()}`;
    const projectId = projectIdByKey.get(pkey);
    if (!projectId) {
      timeEntriesSkipped++;
      continue;
    }
    const sig = entrySig(pkey, t.description, t.durationSeconds, t.startedAt);
    if (seen.has(sig)) {
      timeEntriesSkipped++;
      continue;
    }
    seen.add(sig);

    const rate = t.rateCents || 0;
    totalSeconds += t.durationSeconds;
    totalCents += amountForTime(t.durationSeconds, rate);
    timeEntriesCreated++;

    if (dryRun || projectId === "dry") continue;
    await db.timeEntry.create({
      data: {
        projectId,
        description: t.description,
        durationSeconds: t.durationSeconds,
        rateCents: rate,
        startedAt: new Date(t.startedAt),
      },
    });
  }

  return {
    clientsCreated,
    projectsCreated,
    timeEntriesCreated,
    timeEntriesSkipped,
    totalSeconds,
    totalCents,
    dryRun,
  };
}
