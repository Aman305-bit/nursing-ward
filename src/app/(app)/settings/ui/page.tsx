import { PageHeader } from "@/components/shell/page-header";
import { ThemeSettingsPanel } from "@/components/theme/theme-settings-panel";

export default function UiSettingsRoute() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="UI Settings"
        description="Manage light, dark, system mode, dynamic primary colors, density, and layout preference for the HMS shell."
        eyebrow="Phase 1 / Theme platform"
      />
      <div className="pt-4">
        <ThemeSettingsPanel />
      </div>
    </div>
  );
}
