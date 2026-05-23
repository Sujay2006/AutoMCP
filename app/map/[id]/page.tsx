import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EndpointMapForm } from "@/components/endpoint-map-form";
import { buttonVariants } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import type { ConfirmedTool, Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await apiClient.getOrNull<Project>(`/api/scan/${id}`, {
    noStore: true,
  });
  if (!project) notFound();

  if (project.source_type === "akaunting_demo") {
    redirect(`/success/${id}`);
  }
  if (!project.backend_config) {
    redirect(`/connect/${id}`);
  }

  const confirmedSource =
    project.confirmed_tools ??
    (project.proposed_tools ?? []).map((t) => ({ ...t, enabled: true }));
  const enabled = (confirmedSource as ConfirmedTool[]).filter(
    (t) => t.enabled !== false,
  );

  if (enabled.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">No tools enabled</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Go back and enable at least one tool to wire up its endpoint.
          </p>
          <Link
            href={`/confirm/${id}`}
            className={buttonVariants({ size: "lg", className: "mt-6" })}
          >
            Back to review
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-16">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            AutoMCP
          </Link>{" "}
          /{" "}
          <Link
            href={`/confirm/${id}`}
            className="hover:text-foreground hover:underline"
          >
            Review
          </Link>{" "}
          /{" "}
          <Link
            href={`/connect/${id}`}
            className="hover:text-foreground hover:underline"
          >
            Connect
          </Link>{" "}
          / Map endpoints
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Map your tool endpoints
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          Review the inferred URL paths and HTTP methods for each tool. Test
          them all before deploying — AutoMCP refuses to deploy a Worker if any
          tool test fails.
        </p>
      </header>

      <EndpointMapForm
        projectId={id}
        tools={enabled}
        detectedActions={project.detected_actions ?? []}
        savedEndpoints={project.backend_config.tool_endpoints ?? {}}
        initialResults={project.tool_test_results}
      />

      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <Link
          href={`/connect/${id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Back to connect
        </Link>
      </div>
    </main>
  );
}
