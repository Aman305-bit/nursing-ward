export type RadiologyPriority = "Routine" | "Urgent" | "STAT" | "ASAP";

export type RadiologyTest = {
  id: string;
  name: string;
  description: string;
  modality: string;
  category?: string;
  code?: string;
  specifications?: string[];
};

export type RadiologyGroup = {
  id: string;
  name: string;
  modality: string;
  tests?: string[];
};

export type RadiologySummaryRow = {
  id: string;
  selectedTests: string;
  loincCode: string;
  category: string;
  specification: string;
  priority: RadiologyPriority;
  status: "Ordered" | "Scheduled" | "Completed" | "Reviewed";
  orderDateTime: string;
};

export type RadiologyClinicalInfo = {
  diagnosis: string;
  indication: string;
  notes: string;
  preferredDate: string;
  preferredTime: string;
};

export type RadiologyResultRow = {
  parameter: string;
  result: string;
  unit: string;
  referenceRange: string;
};

export type RadiologyResultBlock = {
  id: string;
  selectedTests: string;
  loincCode: string;
  category: string;
  specification: string;
  priority: RadiologyPriority;
  reportDate?: string;
  radiologist?: string;
  findings?: string;
  impression?: string;
  rows: RadiologyResultRow[];
};
