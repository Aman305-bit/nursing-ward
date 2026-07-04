export type LdtFieldType = "text" | "date" | "time" | "number" | "select" | "multiselect";
export type LdtFieldGroup = "property" | "assessment";
export type LdtFieldOption = { label: string; value: string };

export type LdtDynamicField = {
  id: string;
  label: string;
  type: LdtFieldType;
  group: LdtFieldGroup;
  options?: LdtFieldOption[];
};

export type LdtTypeConfig = {
  id: string;
  label: string;
  ldtName: string;
  propertyIds: string[];
  assessmentIds: string[];
  fields: LdtDynamicField[];
};

const optionPairs = (values: string[]) => values.map((value) => ({ label: value, value }));

const LDT_CONFIGS: LdtTypeConfig[] = [
  {
    id: "line",
    label: "Line",
    ldtName: "PICC Single Lumen",
    propertyIds: ["placementDate", "placementTime", "locationOfInsertion", "size", "length", "placementVerification"],
    assessmentIds: ["siteAssessment", "ldtStatus", "dressingType", "dressingStatus"],
    fields: [
      { id: "placementDate", label: "Placement Date", type: "date", group: "property" },
      { id: "placementTime", label: "Placement Time", type: "time", group: "property" },
      { id: "locationOfInsertion", label: "Location of Insertion", type: "text", group: "property" },
      { id: "size", label: "Size", type: "number", group: "property" },
      { id: "length", label: "Length", type: "number", group: "property" },
      { id: "placementVerification", label: "Placement Verification", type: "select", group: "property", options: optionPairs(["Confirmed", "Pending", "Not Verified"]) },
      { id: "siteAssessment", label: "Site Assessment", type: "multiselect", group: "assessment", options: optionPairs(["Clean", "Dry", "Intact", "Redness", "Swelling", "Discharge"]) },
      { id: "ldtStatus", label: "LDT Status", type: "select", group: "assessment", options: optionPairs(["Active", "Completed", "On Hold", "Discontinued"]) },
      { id: "dressingType", label: "Dressing Type", type: "select", group: "assessment", options: optionPairs(["Transparent", "Gauze", "Occlusive"]) },
      { id: "dressingStatus", label: "Dressing Status", type: "select", group: "assessment", options: optionPairs(["Clean", "Changed", "Required", "Dry"]) },
    ],
  },
  {
    id: "drain",
    label: "Drain",
    ldtName: "Intercoastal Drain",
    propertyIds: ["insertionDate", "catheterSize", "balloonVolume"],
    assessmentIds: ["urineColor", "catheterStatus"],
    fields: [
      { id: "insertionDate", label: "Insertion Date", type: "date", group: "property" },
      { id: "catheterSize", label: "Catheter Size", type: "number", group: "property" },
      { id: "balloonVolume", label: "Balloon Volume", type: "number", group: "property" },
      { id: "urineColor", label: "Urine Color", type: "select", group: "assessment", options: optionPairs(["Clear", "Yellow", "Amber", "Cloudy", "Bloody"]) },
      { id: "catheterStatus", label: "Catheter Status", type: "select", group: "assessment", options: optionPairs(["Patent", "Blocked", "Leaking", "Removed"]) },
    ],
  },
  {
    id: "tube",
    label: "Tube",
    ldtName: "Nasogastric Tube",
    propertyIds: ["insertionDate", "catheterSize", "balloonVolume"],
    assessmentIds: ["urineColor", "catheterStatus"],
    fields: [
      { id: "insertionDate", label: "Insertion Date", type: "date", group: "property" },
      { id: "catheterSize", label: "Tube Size", type: "number", group: "property" },
      { id: "balloonVolume", label: "Balloon Volume", type: "number", group: "property" },
      { id: "urineColor", label: "Assessment Status", type: "select", group: "assessment", options: optionPairs(["Clear", "Yellow", "Amber", "Cloudy", "Bloody"]) },
      { id: "catheterStatus", label: "Tube Status", type: "select", group: "assessment", options: optionPairs(["Patent", "Blocked", "Leaking", "Removed"]) },
    ],
  },
];

export const DEFAULT_LDT_TYPE_ID = LDT_CONFIGS[0]?.id ?? "";

export function getLdtTypeConfig(ldtTypeId: string) {
  return LDT_CONFIGS.find((item) => item.id === ldtTypeId) ?? null;
}

export function getAllLdtTypeConfigs() {
  return LDT_CONFIGS;
}
