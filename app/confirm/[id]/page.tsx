import Link from "next/link";
import { notFound } from "next/navigation";
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
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">No tools to review yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {project.status === "failed"
              ? (project.error ?? "The scan failed.")
              : "This project is still being processed."}
          </p>
          <Link
            href="/"
            className={buttonVariants({ size: "lg", className: "mt-6" })}
          >
            Start over
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-16">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            AutoMCP
          </Link>{" "}
          / Review
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Review your tools
        </h1>
        <p className="mt-2 text-muted-foreground">
          These are the actions AI agents will be able to take on your site. You
          can rename, edit descriptions, or toggle write actions off.
        </p>
      </header>

      <ToolList
        projectId={project.id}
        sourceType={project.source_type}
        initialTools={tools}
      />
    </main>
  );
}
