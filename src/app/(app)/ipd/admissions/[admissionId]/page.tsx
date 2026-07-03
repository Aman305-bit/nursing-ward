import { AdmissionDetailPage } from "@/features/ipd/ipd-pages";

export default async function Page({ params }: { params: Promise<{ admissionId: string }> }) {
  const { admissionId } = await params;
  return <AdmissionDetailPage admissionId={admissionId} />;
}
