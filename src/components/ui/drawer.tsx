"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col rounded-t-xl border border-border bg-surface shadow-soft outline-none md:inset-y-0 md:left-auto md:right-0 md:h-dvh md:max-h-none md:w-[520px] md:rounded-none",
            className,
          )}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-surface px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-xs text-muted-foreground">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close drawer">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
          {footer ? <div className="sticky bottom-0 border-t border-border bg-surface p-3">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
