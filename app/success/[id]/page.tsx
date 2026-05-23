import Link from "next/link";
import { Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
      </div>

      {/* <InstallSnippets mcpUrl={...} /> */}

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Build another
        </Link>
      </div>
    </AppShell>
  );
}
