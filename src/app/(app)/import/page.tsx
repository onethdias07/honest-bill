import { ImportForm } from "@/components/import-form";

export const dynamic = "force-dynamic";

export default function ImportPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">Import your data</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bring your clients, projects, and time history over from Harvest in
          minutes — by CSV or directly via the Harvest API. Preview first to see
          exactly what will be created; nothing is saved until you click Import.
          Switching shouldn&apos;t cost you your history.
        </p>
      </div>
      <ImportForm />
    </div>
  );
}
