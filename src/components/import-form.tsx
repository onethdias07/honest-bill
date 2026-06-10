"use client";

import { useState, useTransition } from "react";
import { FileUp, KeyRound, Loader2 } from "lucide-react";
import { importCsv, importHarvestApi } from "@/app/import/actions";
import type { ImportSummary } from "@/lib/import";
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
import { formatMoney, formatDuration } from "@/lib/money";

type Result = (ImportSummary & { error?: string }) | null;

function ResultBox({ r }: { r: ImportSummary & { error?: string } }) {
  if (r.error) {
    return (
      <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {r.error}
      </div>
    );
  }
  const verb = r.dryRun ? "Would import" : "Imported";
  return (
    <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm">
      <p className="font-medium">
        {r.dryRun ? "Preview" : "Done"} — {verb.toLowerCase()}{" "}
        {r.clientsCreated} client(s), {r.projectsCreated} project(s),{" "}
        {r.timeEntriesCreated} time entr(ies).
      </p>
      <p className="mt-1 text-muted-foreground">
        {formatDuration(r.totalSeconds)} · {formatMoney(r.totalCents)} billable
        {r.timeEntriesSkipped > 0
          ? ` · ${r.timeEntriesSkipped} duplicate entr(ies) skipped`
          : ""}
        .
      </p>
      {r.dryRun && (
        <p className="mt-1 text-xs text-muted-foreground">
          Nothing was saved yet — click Import to apply.
        </p>
      )}
    </div>
  );
}

export function ImportForm() {
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [token, setToken] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [pending, startTransition] = useTransition();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setCsvText(await f.text());
    setResult(null);
  }

  function run(fn: () => Promise<ImportSummary & { error?: string }>) {
    setResult(null);
    startTransition(async () => setResult(await fn()));
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="size-5 text-primary" /> Import from a CSV export
          </CardTitle>
          <CardDescription>
            In Harvest: Reports → Detailed Time → Export → CSV. Upload it here.
            Re-importing the same file is safe (duplicates are skipped).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="csv">CSV file</Label>
            <Input id="csv" type="file" accept=".csv,text/csv" onChange={onFile} />
            {fileName && (
              <p className="text-xs text-muted-foreground">Loaded: {fileName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!csvText || pending}
              onClick={() => run(() => importCsv(csvText, true))}
            >
              {pending && <Loader2 className="animate-spin" />} Preview
            </Button>
            <Button
              disabled={!csvText || pending}
              onClick={() => run(() => importCsv(csvText, false))}
            >
              {pending && <Loader2 className="animate-spin" />} Import
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" /> Import via Harvest API
          </CardTitle>
          <CardDescription>
            One-click pull of clients, projects and time. Create a Personal
            Access Token at id.getharvest.com/developers — it shows your Account
            ID and token. We never store them; they&apos;re used for this import
            only.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="1234567"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="token">Personal Access Token</Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="pat.xxxxxxxx..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!accountId || !token || pending}
              onClick={() => run(() => importHarvestApi(accountId, token, true))}
            >
              {pending && <Loader2 className="animate-spin" />} Preview
            </Button>
            <Button
              disabled={!accountId || !token || pending}
              onClick={() => run(() => importHarvestApi(accountId, token, false))}
            >
              {pending && <Loader2 className="animate-spin" />} Import
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && <ResultBox r={result} />}
    </div>
  );
}
