"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";

export function UrlInput() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState<"scan" | "demo" | null>(null);

  async function startScan() {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Paste a GitHub repo or website URL first.");
      return;
    }
    setLoading("scan");
    try {
      const data = await apiClient.post<{ projectId: string }>("/api/scan", {
        sourceUrl: trimmed,
      });
      router.push(`/scan/${data.projectId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      setLoading(null);
    }
  }

  async function startDemo() {
    setLoading("demo");
    try {
      const data = await apiClient.post<{ projectId: string }>(
        "/api/scan/akaunting-demo",
      );
      router.push(`/scan/${data.projectId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div className="w-full max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="url"
          placeholder="https://github.com/your/repo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") startScan();
          }}
          disabled={loading !== null}
          className="h-12 flex-1 text-base"
        />
        <Button
          onClick={startScan}
          disabled={loading !== null}
          size="lg"
          className="h-12 gap-2 px-6 text-base"
        >
          {loading === "scan" ? (
            <>
              <Spinner />
              Starting…
            </>
          ) : (
            <>
              Generate MCP
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>

      <button
        type="button"
        onClick={startDemo}
        disabled={loading !== null}
        className="mt-4 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-50"
      >
        {loading === "demo"
          ? "Loading demo…"
          : "or try with a demo — Akaunting accounting →"}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
