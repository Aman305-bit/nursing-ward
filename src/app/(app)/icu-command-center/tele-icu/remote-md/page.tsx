import { NursingIcuModulePage } from "@/features/nursing-icu/nursing-icu-pages";

export default async function IcuCommandCenterTeleIcuRemoteMdRoute({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const { patientId } = await searchParams;
  return <NursingIcuModulePage initialTeleIcuPatientId={patientId} page="tele-icu-remote-md" />;
}
