// All money is integer cents. All durations are integer seconds.

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100);
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds ?? 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function decimalHours(seconds: number): number {
  return Math.round(((seconds ?? 0) / 3600) * 100) / 100;
}

// Billable amount for a duration at a given hourly rate, in cents.
export function amountForTime(seconds: number, rateCents: number): number {
  return Math.round(((seconds ?? 0) / 3600) * (rateCents ?? 0));
}

// Parse a user-entered dollar string (e.g. "85", "85.50") into cents.
export function dollarsToCents(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}
