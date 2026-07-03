import { PanelRightOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BundleItem } from "@/features/bundle/bundle-types";

export const drawerBundle: BundleItem = {
  id: "drawer",
  category: "Feedback",
  title: "Drawer",
  description: "Side panel pattern with title, body, footer actions, and controlled open state.",
  icon: PanelRightOpen,
  code: String.raw`"use client";

import * as React from "react";
import { PanelRightOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";

export function DrawerBundle() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}><PanelRightOpen className="h-4 w-4" />Open drawer</Button>
      <Drawer open={open} onOpenChange={setOpen} title="Patient action" description="Review details before save." footer={<Button onClick={() => setOpen(false)}>Save</Button>}>
        <Input placeholder="Reason" />
      </Drawer>
    </>
  );
}`,
  renderPreview: ({ openDrawer }) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={openDrawer}><PanelRightOpen className="h-4 w-4" />Open drawer</Button>
      <span className="text-sm text-muted-foreground">Controlled side panel with footer actions.</span>
    </div>
  ),
};
