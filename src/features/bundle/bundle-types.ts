import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type BundleCategory =
  | "Actions"
  | "Forms"
  | "Layout"
  | "Data"
  | "Foundation"
  | "Data Display"
  | "Feedback"
  | "Healthcare"
  | "Workflow"
  | "Settings";

export type BundlePreviewApi = {
  openDrawer: () => void;
  openModal: () => void;
  showToast: (message?: unknown) => void;
};

export type BundleSection = {
  title: string;
  description: string;
  examples: string[];
};

export type BundleItem = {
  id: string;
  label?: string;
  title: string;
  description: string;
  category: BundleCategory;
  icon: LucideIcon;
  count?: number;
  keywords?: string[];
  sections?: BundleSection[];
  usage?: string;
  code?: string;
  renderPreview?: (api: BundlePreviewApi) => ReactNode;
};

export const fieldClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";
