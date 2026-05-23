import { AppShell, PageHeading } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function ConnectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
      {/* <ConnectForm projectId={id} ... /> */}
    </AppShell>
  );
}
