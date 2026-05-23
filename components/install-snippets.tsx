"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function snippetsFor(mcpUrl: string) {
  return [
    {
      client: "Claude Desktop",
      hint: "Add to claude_desktop_config.json, then restart Claude.",
      code: JSON.stringify(
        {
          mcpServers: {
            automcp: { command: "npx", args: ["-y", "mcp-remote", mcpUrl] },
          },
        },
        null,
        2,
      ),
    },
    {
      client: "Cursor",
      hint: "Add to ~/.cursor/mcp.json, then reload Cursor.",
      code: JSON.stringify(
        { mcpServers: { automcp: { url: mcpUrl } } },
        null,
        2,
      ),
    },
    {
      client: "Claude.ai",
      hint: "Settings → Connectors → Add custom connector → paste this URL.",
      code: mcpUrl,
    },
  ];
}

export function InstallSnippets({ mcpUrl }: { mcpUrl: string }) {
  return (
    <div className="space-y-6">
      <McpUrlBar url={mcpUrl} />
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Connect it to your tools
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {snippetsFor(mcpUrl).map((s) => (
            <SnippetCard key={s.client} {...s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }
  return { copied, copy };
}

function McpUrlBar({ url }: { url: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-2 pl-4">
      <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm">
        {url}
      </code>
      <Button
        onClick={() => copy(url, "MCP URL")}
        variant="secondary"
        className="shrink-0 gap-1.5"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function SnippetCard({
  client,
  hint,
  code,
}: {
  client: string;
  hint: string;
  code: string;
}) {
  const { copied, copy } = useCopy();
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{client}</h3>
        <button
          type="button"
          onClick={() => copy(code, `${client} snippet`)}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="size-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3" /> Copy
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </Card>
  );
}
