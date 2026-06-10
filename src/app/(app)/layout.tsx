import { AppSidebar } from "@/components/app-sidebar";

// Layout for the authenticated app shell (sidebar). Marketing pages like
// /founding live outside this route group and render full-width.
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
