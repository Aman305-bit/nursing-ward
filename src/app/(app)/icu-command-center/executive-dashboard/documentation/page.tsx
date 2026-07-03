import { NursingIcuModulePage } from "@/features/nursing-icu/nursing-icu-pages";

export default async function IcuCommandCenterExecutiveDocumentationRoute({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const { unit } = await searchParams;
  return <NursingIcuModulePage initialExecutiveUnitId={unit} page="executive-documentation" />;
}
