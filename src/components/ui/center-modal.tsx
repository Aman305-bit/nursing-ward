"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CenterModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  scrollToTopOnOpen = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  scrollToTopOnOpen?: boolean;
}) {
  const bodyRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !scrollToTopOnOpen) return;
    const frame = requestAnimationFrame(() => bodyRef.current?.scrollTo({ top: 0 }));
    return () => cancelAnimationFrame(frame);
  }, [open, scrollToTopOnOpen]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[92dvh] w-[min(94vw,980px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border bg-surface px-4 py-3">
            <div className="min-w-0">
              <Dialog.Title className="text-sm font-semibold text-foreground">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-xs text-muted-foreground">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close preview" size="icon" type="button" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5" ref={bodyRef}>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
