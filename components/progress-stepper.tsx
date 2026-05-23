import { Check, X } from "lucide-react";
import type { FetchProgress, ScanStep } from "@/lib/types";

type StepDef = {
  key: Exclude<ScanStep, "complete" | "failed">;
  label: string;
};

const STEPS: StepDef[] = [
  { key: "fetching_source", label: "Reading source" },
  { key: "classifying", label: "Classifying website" },
  { key: "extracting_actions", label: "Extracting actions" },
  { key: "designing_tools", label: "Designing tools" },
];

/** Resolve `current_step` to an index into STEPS (or STEPS.length for done). */
function stepIndex(current: ScanStep | null | undefined): number {
  if (!current) return 0; // before the first phase has been stamped
  if (current === "complete") return STEPS.length;
  if (current === "failed") return 0;
  const idx = STEPS.findIndex((s) => s.key === current);
  return idx === -1 ? 0 : idx;
}

/**
 * Status-driven scan progress indicator. Renders straight from the server's
 * `current_step` value — no client-side timer. The fetch-progress counter is
 * shown only while step 1 (`fetching_source`) is active.
 */
export function ProgressStepper({
  currentStep,
  failed = false,
  fetchProgress,
}: {
  currentStep: ScanStep | null | undefined;
  failed?: boolean;
  fetchProgress?: FetchProgress | null;
}) {
  const idx = stepIndex(currentStep);
  const allDone = currentStep === "complete";

  return (
    <ol className="space-y-3">
      {STEPS.map((step, i) => {
        const done = allDone || i < idx;
        const active = i === idx && !failed && !allDone;
        const errored = i === idx && failed;
        const showFetchCounter =
          active && step.key === "fetching_source" && !!fetchProgress;

        return (
          <li
            key={step.key}
            className="flex items-start gap-3 rounded-xl border bg-card px-4 py-3.5"
          >
            <span
              className={[
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                done
                  ? "bg-emerald-500 text-white"
                  : active
                    ? "bg-primary/10 text-primary"
                    : errored
                      ? "bg-destructive text-white"
                      : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {done ? (
                <Check className="size-4" />
              ) : errored ? (
                <X className="size-4" />
              ) : active ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                i + 1
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={
                  done || active ? "font-medium" : "text-muted-foreground"
                }
              >
                {step.label}
              </p>
              {showFetchCounter && fetchProgress!.total > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                  Fetched {fetchProgress!.fetched} of {fetchProgress!.total}{" "}
                  files
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
