"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell, PageHeading } from "@/components/app-shell";
import { ProgressStepper } from "@/components/progress-stepper";
import { buttonVariants } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import type { FetchProgress, ScanStep } from "@/lib/types";

type ScanRow = {
  status: string;
  current_step: ScanStep | null;
  fetch_progress: FetchProgress | null;
  error: string | null;
};

const POLL_MS = 1500;

export default function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [row, setRow] = useState<ScanRow | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabase();

    async function fetchOnce() {
      const { data, error } = await supabase
        .from("projects")
        .select("status, current_step, fetch_progress, error")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setFatal(error.message);
        return;
      }
      if (!data) {
        setFatal("Project not found.");
        return;
      }
      setRow(data as ScanRow);

      // Forward as soon as the scan finishes.
      if (data.status === "reviewing" || data.current_step === "complete") {
        router.replace(`/confirm/${id}`);
      }
    }

    fetchOnce();
    const handle = setInterval(fetchOnce, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, [id, router]);

  const failed = row?.status === "failed" || row?.current_step === "failed";

  return (
    <AppShell width="xl" crumbs={[{ label: "Scan" }]}>
      <PageHeading
        eyebrow="Building your bridge"
        title={
          failed
            ? "Scan failed"
            : row?.current_step === "complete"
              ? "Done — redirecting…"
              : "Building your MCP server"
        }
        body={
          failed
            ? (row?.error ?? "Something went wrong during the scan.")
            : "We're reading the code and designing the agent tools. Hang tight — this usually takes under a minute."
        }
      />

      {fatal ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {fatal}
        </div>
      ) : (
        <ProgressStepper
          currentStep={row?.current_step ?? "fetching_source"}
          failed={failed}
          fetchProgress={row?.fetch_progress ?? { fetched: 0, total: 0 }}
        />
      )}

      {failed && (
        <Link
          href="/"
          className={buttonVariants({ size: "lg", className: "mt-8" })}
        >
          Start over
        </Link>
      )}

      <p className="mt-6 text-xs text-muted-foreground">Project ID: {id}</p>
    </AppShell>
  );
}
