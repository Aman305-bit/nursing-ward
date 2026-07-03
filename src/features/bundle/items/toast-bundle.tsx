import { Bell } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { BundleItem } from "@/features/bundle/bundle-types";

export const toastBundle: BundleItem = {
  id: "toast",
  category: "Feedback",
  title: "Toast",
  description: "Quick user feedback for save, warning, and blocked actions.",
  icon: Bell,
  code: String.raw`import { Bell } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ToastBundle() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.success("Saved successfully")}>Success toast</Button>
      <Button variant="outline" onClick={() => toast.info("Review pending")}><Bell className="h-4 w-4" />Info toast</Button>
      <Button variant="danger" onClick={() => toast.error("Action blocked")}>Error toast</Button>
    </div>
  );
}`,
  renderPreview: ({ showToast }) => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={showToast}>Success toast</Button>
      <Button variant="outline" onClick={() => toast.info("Review pending")}><Bell className="h-4 w-4" />Info toast</Button>
      <Button variant="danger" onClick={() => toast.error("Action blocked")}>Error toast</Button>
    </div>
  ),
};
