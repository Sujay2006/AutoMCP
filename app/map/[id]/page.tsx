import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell, PageHeading } from "@/components/app-shell";
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
      <AppShell
        width="3xl"
        crumbs={[
          { label: "Review", href: `/confirm/${id}` },
          { label: "Connect", href: `/connect/${id}` },
          { label: "Map" },
        ]}
      >
        <PageHeading
          eyebrow="Step 04 / Map endpoints"
          title="No tools enabled"
          body="Go back and enable at least one tool to wire up its endpoint."
        />
        <Link
          href={`/confirm/${id}`}
          className={buttonVariants({ size: "lg", className: "mt-2" })}
        >
          Back to review
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell
      width="3xl"
      crumbs={[
        { label: "Review", href: `/confirm/${id}` },
        { label: "Connect", href: `/connect/${id}` },
        { label: "Map" },
      ]}
    >
      <PageHeading
        eyebrow="Step 04 / Map endpoints"
        title="Map your tool endpoints"
        body="Review the inferred URL paths and HTTP methods for each tool. Test them all before deploying — we refuse to deploy a Worker if any tool test fails."
      />
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
    </AppShell>
  );
}
