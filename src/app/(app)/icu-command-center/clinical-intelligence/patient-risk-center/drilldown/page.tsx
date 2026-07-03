import { NursingIcuModulePage } from "@/features/nursing-icu/nursing-icu-pages";

export default async function IcuCommandCenterPatientRiskDrilldownRoute({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string; patientId?: string }>;
}) {
  const { focus, patientId } = await searchParams;
  return <NursingIcuModulePage initialRiskFocus={focus} initialRiskPatientId={patientId} page="patient-risk-drilldown" />;
}
