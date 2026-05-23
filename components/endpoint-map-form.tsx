"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import type {
  ConfirmedTool,
  ContentType,
  DetectedAction,
  ToolEndpoint,
  ToolTestResults,
} from "@/lib/types";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const CONTENT_TYPES: ContentType[] = [
  "application/json",
  "application/x-www-form-urlencoded",
];

function inferEndpoint(
  tool: ConfirmedTool,
  detected: DetectedAction[],
): ToolEndpoint | null {
  const matches = detected.filter(
    (a) => (tool.source_action ?? []).includes(a.name) && a.path,
  );
  if (matches.length === 0) return null;
  const best = matches.slice().sort((a, b) => b.confidence - a.confidence)[0];
  return {
    path: best.path!,
    method: best.http_method.toUpperCase(),
    content_type: best.content_type,
    requires_auth: best.requires_auth,
  };
}

export function EndpointMapForm({
  projectId,
  tools,
  detectedActions,
  savedEndpoints,
  initialResults,
}: {
  projectId: string;
  tools: ConfirmedTool[];
  detectedActions: DetectedAction[];
  savedEndpoints: Record<string, ToolEndpoint>;
  initialResults: ToolTestResults | null;
}) {
  const router = useRouter();

  const [endpoints, setEndpoints] = useState<Record<string, ToolEndpoint>>(
    () => {
      const out: Record<string, ToolEndpoint> = {};
      for (const t of tools) {
        const saved = savedEndpoints[t.name];
        if (saved) {
          out[t.name] = saved;
          continue;
        }
        const inferred = inferEndpoint(t, detectedActions);
        if (inferred) {
          out[t.name] = inferred;
          continue;
        }
        out[t.name] = {
          path: "",
          method: t.is_write ? "POST" : "GET",
          content_type: "application/json",
          requires_auth: true,
        };
      }
      return out;
    },
  );
  const [results, setResults] = useState<ToolTestResults | null>(
    initialResults,
  );
  const [testing, setTesting] = useState(false);
  const [deploying, setDeploying] = useState(false);

  function update(toolName: string, patch: Partial<ToolEndpoint>) {
    setEndpoints((prev) => ({
      ...prev,
      [toolName]: { ...prev[toolName], ...patch },
    }));
    setResults(null);
  }

  const passing = useMemo(() => {
    if (!results) return 0;
    return tools.filter((t) => results[t.name]?.pass).length;
  }, [results, tools]);

  const allPass = results !== null && passing === tools.length;

  async function testAll() {
    const blanks = tools.filter((t) => !endpoints[t.name]?.path?.trim());
    if (blanks.length > 0) {
      toast.error(
        `Path required for: ${blanks.map((t) => t.name).join(", ")}`,
      );
      return;
    }
    setTesting(true);
    try {
      const data = await apiClient.post<{ results: ToolTestResults }>(
        "/api/test-tools",
        { projectId, toolEndpoints: endpoints },
      );
      setResults(data.results);
      const passed = Object.values(data.results).filter((r) => r.pass).length;
      const total = Object.keys(data.results).length;
      if (passed === total) {
        toast.success(`All ${total} tools passed.`);
      } else {
        toast.error(
          `${total - passed} of ${total} tools failed — fix the paths and retry.`,
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test failed");
    } finally {
      setTesting(false);
    }
  }

  async function deployNow() {
    setDeploying(true);
    try {
      await apiClient.post("/api/generate-mcp", { projectId });
      await apiClient.post("/api/deploy", { projectId });
      toast.success("Your MCP is live.");
      router.push(`/success/${projectId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deployment failed");
      setDeploying(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {tools.map((tool) => {
          const e = endpoints[tool.name];
          const result = results?.[tool.name];
          const wasInferred =
            inferEndpoint(tool, detectedActions) !== null ||
            !!savedEndpoints[tool.name];

          return (
            <Card key={tool.name} className="gap-3 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded bg-muted px-2 py-1 font-mono text-sm font-semibold">
                  {tool.name}
                </code>
                {tool.is_write && (
                  <Badge variant="destructive">Write action</Badge>
                )}
                {result &&
                  (result.pass ? (
                    <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      ✓ {result.status ?? "pass"}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      ✗ {result.status ?? "fail"}
                    </Badge>
                  ))}
              </div>

              {!wasInferred && !e.path && (
                <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-xs text-amber-700 dark:text-amber-400">
                  ⚠ Couldn&apos;t auto-detect the path from your code. Please
                  specify it manually.
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-[1fr_120px_180px]">
                <div className="space-y-1">
                  <Label
                    htmlFor={`path-${tool.name}`}
                    className="text-xs text-muted-foreground"
                  >
                    Path
                  </Label>
                  <Input
                    id={`path-${tool.name}`}
                    value={e.path}
                    placeholder="/api/v1/items"
                    onChange={(ev) => update(tool.name, { path: ev.target.value })}
                    className="h-9 font-mono text-sm"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`method-${tool.name}`}
                    className="text-xs text-muted-foreground"
                  >
                    Method
                  </Label>
                  <select
                    id={`method-${tool.name}`}
                    value={e.method}
                    onChange={(ev) =>
                      update(tool.name, { method: ev.target.value })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`ct-${tool.name}`}
                    className="text-xs text-muted-foreground"
                  >
                    Content-Type
                  </Label>
                  <select
                    id={`ct-${tool.name}`}
                    value={e.content_type}
                    onChange={(ev) =>
                      update(tool.name, {
                        content_type: ev.target.value as ContentType,
                      })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {CONTENT_TYPES.map((c) => (
                      <option key={c} value={c}>
                        {c === "application/json" ? "JSON" : "Form (urlencoded)"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {result && !result.pass && result.error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
                  {result.error}
                </div>
              )}
              {result && result.snippet && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Response snippet
                  </summary>
                  <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 font-mono">
                    {result.snippet}
                  </pre>
                </details>
              )}
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-xl border bg-card/95 p-4 shadow-sm backdrop-blur">
        <span className="text-sm text-muted-foreground">
          {results
            ? `${passing} / ${tools.length} passed`
            : `${tools.length} tools to test`}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={testAll}
            disabled={testing || deploying}
            variant={allPass ? "outline" : "default"}
            className="gap-2"
          >
            {testing ? (
              <>
                <Spinner /> Testing…
              </>
            ) : results ? (
              "Re-test all"
            ) : (
              "Test all tools"
            )}
          </Button>
          {allPass && (
            <Button onClick={deployNow} disabled={deploying} className="gap-2">
              {deploying ? (
                <>
                  <Spinner /> Deploying…
                </>
              ) : (
                "Generate & Deploy MCP →"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
