import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { InstallSnippets } from "@/components/install-snippets";
import { buttonVariants } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await apiClient.getOrNull<Project>(`/api/scan/${id}`, {
    noStore: true,
  });
  if (!project) notFound();

  if (!project.mcp_url) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">Deployment not complete</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {project.error ?? "This MCP server hasn't been deployed yet."}
          </p>
          <Link
            href={
              project.source_type === "akaunting_demo"
                ? `/confirm/${id}`
                : `/map/${id}`
            }
            className={buttonVariants({ size: "lg", className: "mt-6" })}
          >
            Back to review
          </Link>
        </div>
      </main>
    );
  }

  const toolCount = project.confirmed_tools?.length ?? 0;
  const isDemo = project.source_type === "akaunting_demo";
  const results = project.tool_test_results;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-16">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="size-7" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          Your MCP is live
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          {toolCount} tool{toolCount === 1 ? "" : "s"} from{" "}
          <span className="font-medium text-foreground">
            {project.source_url}
          </span>{" "}
          are now available to any AI agent.
        </p>
      </div>

      <div className="mt-10">
        <InstallSnippets mcpUrl={project.mcp_url} />
      </div>

      {/* Live Tool Tests — proof the deployment actually works. */}
      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {isDemo ? "Demo tools" : "Live tool tests"}
        </h2>
        {isDemo ? (
          <p className="mt-3 text-sm text-muted-foreground">
            The demo MCP serves baked-in mock data. Connect a real backend (any
            URL on the landing page) to see live tool tests here.
          </p>
        ) : results && Object.keys(results).length > 0 ? (
          <ul className="mt-3 space-y-2">
            {(project.confirmed_tools ?? []).map((tool) => {
              const r = results[tool.name];
              return (
                <li
                  key={tool.name}
                  className="rounded-lg border bg-card p-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <StatusDot pass={!!r?.pass} />
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
                      {tool.name}
                    </code>
                    {r?.status && (
                      <span className="text-xs text-muted-foreground">
                        HTTP {r.status}
                      </span>
                    )}
                  </div>
                  {r?.error && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {r.error}
                    </p>
                  )}
                  {r?.snippet && (
                    <pre className="mt-1.5 max-h-24 overflow-auto rounded bg-muted p-2 text-xs">
                      {r.snippet}
                    </pre>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No tool test results were recorded.
          </p>
        )}
      </section>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a
          href={project.mcp_url}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Open the MCP endpoint
        </a>
        <a
          href="https://modelcontextprotocol.io/inspector"
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Test it in MCP Inspector
        </a>
        {!isDemo && (
          <Link
            href={`/connect/${id}`}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Reconfigure backend
          </Link>
        )}
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Build another
        </Link>
      </div>
    </main>
  );
}

function StatusDot({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
      ✓
    </span>
  ) : (
    <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
      ✗
    </span>
  );
}

