import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, PageHeading } from "@/components/app-shell";
import { ToolList } from "@/components/tool-list";
import { buttonVariants } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await apiClient.getOrNull<Project>(`/api/scan/${id}`, {
    noStore: true,
  });
  if (!project) notFound();

  const tools = project.proposed_tools ?? [];

  if (tools.length === 0) {
    return (
      <AppShell width="2xl" crumbs={[{ label: "Review" }]}>
        <PageHeading
          eyebrow="Step 02 / Review"
          title="No tools to review yet"
          body={
            project.status === "failed"
              ? (project.error ?? "The scan failed.")
              : "This project is still being processed."
          }
        />
        <Link
          href="/"
          className={buttonVariants({ size: "lg", className: "mt-2" })}
        >
          Start over
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell width="2xl" crumbs={[{ label: "Review" }]}>
      <PageHeading
        eyebrow="Step 02 / Review"
        title="Review your tools"
        body="These are the actions AI agents will be able to take on your site. Rename them, edit descriptions, or toggle write actions off."
      />
      <ToolList
        projectId={project.id}
        sourceType={project.source_type}
        initialTools={tools}
      />
    </AppShell>
  );
}
