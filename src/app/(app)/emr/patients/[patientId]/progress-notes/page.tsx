import { ProgressNotesPage } from "@/features/emr/emr-pages";

export default async function Page({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  return <ProgressNotesPage patientId={patientId} />;
}
