import { AppShell, PageHeading } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell width="2xl" crumbs={[{ label: "Review" }]}>
      <PageHeading
        eyebrow="Step 02 / Review"
        title="Review your tools"
        body="These are the actions AI agents will be able to take on your site. Rename them, edit descriptions, or toggle write actions off."
      />
      {/* <ToolList projectId={id} ... /> */}
      <p className="text-xs text-muted-foreground">Project ID: {id}</p>
    </AppShell>
  );
}
