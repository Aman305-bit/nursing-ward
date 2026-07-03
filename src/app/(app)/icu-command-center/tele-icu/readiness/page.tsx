import { NursingIcuModulePage } from "@/features/nursing-icu/nursing-icu-pages";

export default async function IcuCommandCenterTeleIcuReadinessRoute({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const { patientId } = await searchParams;
  return <NursingIcuModulePage initialTeleIcuPatientId={patientId} page="tele-icu-readiness" />;
}
