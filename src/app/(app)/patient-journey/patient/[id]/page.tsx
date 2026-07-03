import { PatientJourneyPatientPage } from "@/features/patient-journey/patient-journey-pages";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PatientJourneyPatientPage patientId={id} />;
}
