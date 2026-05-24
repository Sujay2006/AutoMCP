import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { InstallSnippets } from "@/components/install-snippets";
import { buttonVariants } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

type RagStats = {
  ready: boolean;
  total_tools: number;
  categories: string[];
  category_count?: number;
  recent_retrievals?: { count: number; average: number | null };
};

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, ragStats] = await Promise.all([
    apiClient.getOrNull<Project>(`/api/scan/${id}`, { noStore: true }),
    apiClient.getOrNull<RagStats>("/api/rag/stats", { noStore: true }),
  ]);
  if (!project) notFound();

  const ragReady = ragStats?.ready && (ragStats?.total_tools ?? 0) > 0;
  const recent = ragStats?.recent_retrievals;
  const avgSim =
    recent && recent.average != null ? Math.round(recent.average * 100) : null;

  return (
    <AppShell width="3xl" crumbs={[{ label: "Live" }]}>
      <div className="text-center">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-[var(--sage)] text-white shadow-[0_8px_20px_rgba(45,134,89,0.25)]">
          <Check className="size-7" />
        </div>
        <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Your MCP is live
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          Project <span className="font-medium text-foreground">{id}</span> is now available to any AI agent.
        </p>

        {ragReady && (
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--coral)]/30 bg-[var(--soft)] px-4 py-2 text-sm text-[var(--coral)]">
            <Sparkles className="size-4" />
            <span>
              RAG matched similar tools from our{" "}
              <span className="font-semibold">{ragStats!.total_tools}</span>-tool
              knowledge base across{" "}
              <span className="font-semibold">
                {ragStats!.category_count ?? ragStats!.categories.length}
              </span>{" "}
              categories
              {avgSim !== null ? `, avg similarity ${avgSim}%` : ""}.
            </span>
          </div>
        )}
      </div>

      {project.mcp_url && (
        <div className="mt-10">
          <InstallSnippets mcpUrl={project.mcp_url} />
        </div>
      )}

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Build another
        </Link>
      </div>
    </AppShell>
  );
}
