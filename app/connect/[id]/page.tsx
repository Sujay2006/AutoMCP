import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell, PageHeading } from "@/components/app-shell";
import { ConnectForm } from "@/components/connect-form";
import { buttonVariants } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ConnectPage({
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

  return (
    <AppShell
      width="2xl"
      crumbs={[
        { label: "Review", href: `/confirm/${id}` },
        { label: "Connect" },
      ]}
    >
      <PageHeading
        eyebrow="Step 03 / Connect"
        title="Connect your backend"
        body="Where does your application's API live, and how should the AI agent authenticate to it? Credentials are baked into your private MCP Worker — only that Worker can use them."
      />
      <ConnectForm projectId={id} initial={project.backend_config} />
      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <Link
          href={`/confirm/${id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Back to review
        </Link>
      </div>
    </AppShell>
  );
}
