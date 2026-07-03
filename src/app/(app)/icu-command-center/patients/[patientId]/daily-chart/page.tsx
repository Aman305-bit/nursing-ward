import { IcuDailyChartPage } from "@/features/nursing-icu/nursing-icu-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  return <IcuDailyChartPage patientId={patientId} />;
}
