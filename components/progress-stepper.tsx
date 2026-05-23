import { Check, X } from "lucide-react";

type ScanStep =
  | "fetching_source"
  | "classifying"
  | "extracting_actions"
  | "designing_tools"
  | "complete"
  | "failed";

type FetchProgress = { fetched: number; total: number };

type Step = {
  key: Exclude<ScanStep, "complete" | "failed">;
  label: string;
};

const STEPS: Step[] = [
  { key: "fetching_source", label: "Reading source" },
  { key: "classifying", label: "Classifying website" },
  { key: "extracting_actions", label: "Extracting actions" },
  { key: "designing_tools", label: "Designing tools" },
];

function indexOf(step: ScanStep | null | undefined): number {
  if (!step) return 0;
  if (step === "complete") return STEPS.length;
  if (step === "failed") return 0;
  const i = STEPS.findIndex((s) => s.key === step);
  return i === -1 ? 0 : i;
}

export function ProgressStepper({
  currentStep,
  failed = false,
  fetchProgress,
}: {
  currentStep: ScanStep | null | undefined;
  failed?: boolean;
  fetchProgress?: FetchProgress | null;
}) {
  const idx = indexOf(currentStep);
  const allDone = currentStep === "complete";

  return (
    <ol className="space-y-3">
      {STEPS.map((step, i) => {
        const done = allDone || i < idx;
        const active = i === idx && !failed && !allDone;
        const errored = i === idx && failed;
        const showCounter =
          active && step.key === "fetching_source" && !!fetchProgress;

        const dot = done
          ? "bg-[var(--sage)] text-white border-transparent"
          : active
            ? "bg-[var(--soft)] text-[var(--coral)] border-[var(--coral)]/30"
            : errored
              ? "bg-destructive text-white border-transparent"
              : "bg-muted text-muted-foreground border-border";

        return (
          <li
            key={step.key}
            className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-[0_1px_2px_rgba(30,27,26,0.04)]"
          >
            <span
              className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${dot}`}
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
                  done || active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }
              >
                {step.label}
              </p>
              {showCounter && fetchProgress!.total > 0 && (
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
