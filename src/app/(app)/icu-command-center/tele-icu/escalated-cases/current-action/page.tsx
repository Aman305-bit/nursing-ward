import { NursingIcuModulePage } from "@/features/nursing-icu/nursing-icu-pages";

export default async function IcuCommandCenterEscalatedCurrentActionRoute({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>;
}) {
  const { caseId } = await searchParams;
  return <NursingIcuModulePage initialEscalatedCaseId={caseId} page="escalated-action" />;
}
