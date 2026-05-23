"use client";

import { use } from "react";
import Link from "next/link";
import { AppShell, PageHeading } from "@/components/app-shell";
import { ProgressStepper } from "@/components/progress-stepper";

export default function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AppShell width="xl" crumbs={[{ label: "Scan" }]}>
      <PageHeading
        eyebrow="Building your bridge"
        title="Building your MCP server"
        body="We're reading the code and designing the agent tools. Hang tight — this usually takes under a minute."
      />
      <ProgressStepper currentStep={"fetching_source"} fetchProgress={{ fetched: 0, total: 0 }} />
      <p className="mt-6 text-xs text-muted-foreground">Project ID: {id}</p>
    </AppShell>
  );
}
