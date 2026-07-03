import { ConsultationPage } from "@/features/opd/opd-pages";

export default async function Page({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  return <ConsultationPage visitId={visitId} />;
}
