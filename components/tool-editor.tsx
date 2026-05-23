"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ConfirmedTool } from "@/lib/types";

export function ToolEditor({
  tool,
  onChange,
}: {
  tool: ConfirmedTool;
  onChange: (next: ConfirmedTool) => void;
}) {
  const params = Object.entries(tool.inputSchema?.properties ?? {});
  const required = new Set(tool.inputSchema?.required ?? []);

  return (
    <Card
      className={`gap-0 p-5 transition-opacity ${tool.enabled ? "" : "opacity-55"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded bg-muted px-2 py-1 font-mono text-sm font-semibold">
            {tool.name}
          </code>
          {tool.is_write && (
            <Badge variant="destructive">
              Write action — agents can change data
            </Badge>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Label
            htmlFor={`enable-${tool.name}`}
            className="text-xs text-muted-foreground"
          >
            Allow agents
          </Label>
          <Switch
            id={`enable-${tool.name}`}
            checked={tool.enabled}
            onCheckedChange={(v) => onChange({ ...tool, enabled: v })}
          />
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label
          htmlFor={`desc-${tool.name}`}
          className="text-xs text-muted-foreground"
        >
          Description — this is what the AI agent reads
        </Label>
        <Textarea
          id={`desc-${tool.name}`}
          value={tool.description}
          onChange={(e) => onChange({ ...tool, description: e.target.value })}
          rows={3}
          className="resize-none"
        />
      </div>

      {params.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Inputs</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {params.map(([key, prop]) => (
              <li
                key={key}
                className="rounded-md border bg-muted/40 px-2 py-1 font-mono text-xs"
              >
                {key}
                {required.has(key) && <span className="text-destructive">*</span>}
                <span className="text-muted-foreground">
                  : {prop.type ?? "any"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
