import { DoctorOrdersPage } from "@/features/doctor-orders/doctor-orders";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IcuCommandCenterRoute({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const patientId = firstParam(params.patientId);
  const locked = firstParam(params.locked) === "1";
  const mode = firstParam(params.mode) === "detail" ? "detail" : "list";
  const orderId = firstParam(params.orderId);
  const department = firstParam(params.department);

  return <DoctorOrdersPage patientId={patientId} locked={locked} mode={mode} orderId={orderId} department={department} />;
}
