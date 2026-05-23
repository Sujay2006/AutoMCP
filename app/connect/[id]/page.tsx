import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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

  // The Akaunting demo path doesn't have a real backend to connect to —
  // it serves mock data directly from the Worker. Skip straight past.
  if (project.source_type === "akaunting_demo") {
    redirect(`/success/${id}`);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-16">
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
          / Connect backend
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Connect your backend
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          Where does your application&apos;s API live, and how should the AI
          agent authenticate to it? Credentials are baked into your private MCP
          Worker — only that Worker can use them.
        </p>
      </header>

      <ConnectForm projectId={id} initial={project.backend_config} />

      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <Link
          href={`/confirm/${id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          ← Back to review
        </Link>
      </div>
    </main>
  );
}
