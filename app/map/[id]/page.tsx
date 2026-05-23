import { AppShell, PageHeading } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function MapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
      {/* <EndpointMapForm projectId={id} ... /> */}
    </AppShell>
  );
}
