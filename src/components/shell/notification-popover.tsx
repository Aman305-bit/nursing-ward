"use client";

import * as Popover from "@radix-ui/react-popover";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notifications } from "@/data/mock";

export function NotificationPopover() {
  const unread = notifications.filter((item) => item.status === "unread").length;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button size="icon" variant="outline" aria-label="Open notifications" className="relative">
          <Bell className="h-4 w-4" />
          {unread ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
              {unread}
            </span>
          ) : null}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" className="z-[70] w-[min(92vw,420px)] rounded-2xl border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-950">Notifications</div>
              <div className="text-xs text-slate-500">{unread} unread operational alerts</div>
            </div>
            <Button size="sm" variant="ghost">
              <CheckCheck className="h-4 w-4" />
              Mark read
            </Button>
          </div>
          <div className="max-h-96 overflow-auto p-2">
            {notifications.slice(0, 5).map((item) => (
              <Link
                className="block rounded-xl p-3 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href="/notifications"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-900">{item.title}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-slate-500">{item.message}</div>
                  </div>
                  <Badge tone={item.priority === "high" ? "critical" : item.priority === "medium" ? "warning" : "info"}>
                    {item.priority}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-slate-100 p-2">
            <Button asChild className="w-full" variant="outline">
              <Link href="/notifications">Open notification center</Link>
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
