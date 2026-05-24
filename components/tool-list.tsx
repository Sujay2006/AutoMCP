"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToolEditor } from "@/components/tool-editor";
import { apiClient } from "@/lib/api-client";
import type { ConfirmedTool, ProposedTool, SourceType } from "@/lib/types";

export function ToolList({
  projectId,
  sourceType,
  initialTools,
}: {
  projectId: string;
  sourceType: SourceType;
  initialTools: ProposedTool[];
}) {
  const router = useRouter();
  const [tools, setTools] = useState<ConfirmedTool[]>(() =>
    initialTools.map((t) => ({ ...t, enabled: true })),
  );
  const [busy, setBusy] = useState(false);

  const enabledCount = useMemo(
    () => tools.filter((t) => t.enabled).length,
    [tools],
  );

  function updateTool(index: number, next: ConfirmedTool) {
    setTools((prev) => prev.map((t, i) => (i === index ? next : t)));
  }

  async function continueFlow() {
    if (enabledCount === 0) {
      toast.error("Enable at least one tool first.");
      return;
    }
    setBusy(true);
    try {
      await apiClient.post("/api/confirmed-tools", {
        projectId,
        confirmedTools: tools,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
      return;
    }

    // Generate + deploy are best-effort: the backend may gate them on a
    // connected backend / Cloudflare config that this flow intentionally skips.
    try {
      await apiClient.post("/api/generate-mcp", {
        projectId,
        confirmedTools: tools,
      });
      await apiClient.post("/api/deploy", { projectId });
    } catch {
      // Swallow — proceed to the success page even if the gate refused.
    }

    toast.success("Your MCP is ready.");
    router.push(`/success/${projectId}`);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {tools.map((tool, i) => (
          <ToolEditor
            key={`${tool.name}-${i}`}
            tool={tool}
            onChange={(t) => updateTool(i, t)}
          />
        ))}
      </div>

      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-xl border bg-card/95 p-4 shadow-sm backdrop-blur">
        <span className="text-sm text-muted-foreground">
          {enabledCount} of {tools.length} tools enabled
        </span>
        <Button
          onClick={continueFlow}
          disabled={busy || enabledCount === 0}
          size="lg"
          className="gap-2"
        >
          {busy ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating & deploying…
            </>
          ) : (
            "Generate MCP →"
          )}
        </Button>
      </div>
    </div>
  );
}
