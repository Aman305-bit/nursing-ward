import { IcuDischargeSummaryPage } from "@/features/nursing-icu/nursing-icu-pages";

export default async function IcuDischargeSummaryRoute({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = await params;
  return <IcuDischargeSummaryPage workflowId={workflowId} />;
}
