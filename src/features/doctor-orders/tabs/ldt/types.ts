export type LdtOrderType = "Insert" | "Remove" | "Replace";
export type LdtOrderPriority = "Routine" | "Urgent" | "STAT";
export type LdtOrderStatus = "Pending" | "Active" | "Completed" | "Cancelled";

export type LdtOrder = {
  id: string;
  orderNo: string;
  orderType: LdtOrderType;
  ldtName: string;
  priority: LdtOrderPriority;
  orderDate: string;
  status: LdtOrderStatus;
  patientName: string;
  patientId: string;
  doctorName: string;
  notes: string;
};

export type LdtTest = {
  id: string;
  name: string;
  type: LdtOrderType;
  department: string;
  specimen: string;
  priority: LdtOrderPriority;
  status: LdtOrderStatus;
  orderDate: string;
  orderTime?: string;
};

export type LdtSummaryRow = {
  id: string;
  orderNo: string;
  ldtType: string;
  priority: LdtOrderPriority;
  indication: string;
  status: LdtOrderStatus;
  orderDate: string;
};

export type LdtReviewRow = {
  id: string;
  name: string;
  department: string;
  specimen: string;
  result: string;
  unit: string;
  referenceRange: string;
  flag: "N" | "H" | "L";
};

export type LdtOrderFormValues = {
  orderType: LdtOrderType;
  ldtName: string;
  priority: LdtOrderPriority;
  orderDate: string;
  status: LdtOrderStatus;
  patientName: string;
  patientId: string;
  doctorName: string;
  notes: string;
};

