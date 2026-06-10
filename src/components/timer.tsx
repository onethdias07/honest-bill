"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Play, Square } from "lucide-react";
import { logTime } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type ProjectOption = {
  id: string;
  name: string;
  clientName: string;
};

function format(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function Timer({ projects }: { projects: ProjectOption[] }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [running]);

  function start() {
    if (!projectId) return;
    startRef.current = Date.now();
    setElapsed(0);
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    const seconds = Math.max(1, Math.floor((Date.now() - startRef.current) / 1000));
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("description", description);
    fd.set("durationSeconds", String(seconds));
    startTransition(async () => {
      await logTime(fd);
      setElapsed(0);
      setDescription("");
    });
  }

  if (projects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a project first to start tracking time.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="font-mono text-3xl tabular-nums">{format(elapsed)}</span>
        {running ? (
          <Button variant="destructive" onClick={stop} disabled={isPending}>
            <Square /> Stop &amp; log
          </Button>
        ) : (
          <Button onClick={start} disabled={!projectId || isPending}>
            <Play /> Start
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          disabled={running}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.clientName} — {p.name}
            </option>
          ))}
        </Select>
        <Input
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </div>
  );
}
