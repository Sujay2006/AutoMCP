"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressStepper } from "@/components/progress-stepper";
import { buttonVariants } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import type { FetchProgress, ScanStep } from "@/lib/types";

type ScanState = {
  status?: string;
  current_step?: ScanStep | null;
  fetch_progress?: FetchProgress | null;
  error?: string | null;
};

export default function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [state, setState] = useState<ScanState>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function poll(): Promise<boolean> {
      try {
        const data = await apiClient.get<ScanState>(`/api/scan/${id}`, {
          noStore: true,
        });
        if (!active) return true;
        setState(data);

        if (data.status === "reviewing") {
          setTimeout(() => {
            if (active) router.push(`/confirm/${id}`);
          }, 700);
          return true;
        }
        if (data.status === "failed") {
          setError(data.error ?? "The scan failed. Please try another URL.");
          return true;
        }
      } catch {
        // transient network error — keep polling
      }
      return false;
    }

    const pollTimer = setInterval(async () => {
      if (await poll()) clearInterval(pollTimer);
    }, 1500);

    poll().then((done) => {
      if (done) clearInterval(pollTimer);
    });

    return () => {
      active = false;
      clearInterval(pollTimer);
    };
  }, [id, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          {error ? "Scan failed" : "Building your MCP server"}
        </h1>
        <p className="mt-2 mb-8 text-center text-sm text-muted-foreground">
          {error
            ? "We hit a snag reading this source."
            : "Reading the code and designing agent tools."}
        </p>

        <ProgressStepper
          currentStep={state.current_step ?? null}
          failed={!!error}
          fetchProgress={state.fetch_progress ?? null}
        />

        {error && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
            <Link
              href="/"
              className={buttonVariants({ size: "lg", className: "w-full" })}
            >
              Try another URL
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
