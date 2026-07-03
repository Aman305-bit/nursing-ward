"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { CommandSearch } from "@/components/shell/command-search";
import { MobileNavigation } from "@/components/shell/mobile-navigation";
import { NotificationPopover } from "@/components/shell/notification-popover";
import { RoleSwitcher } from "@/components/shell/role-switcher";
import { Button } from "@/components/ui/button";
import { hospitalContext } from "@/data/mock";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-3 py-2 md:px-5">
      <div className="flex min-h-12 items-center gap-3">
        <MobileNavigation />
        <div className="min-w-0 flex-1 border-l border-slate-100 pl-3 lg:border-l-0 lg:pl-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <span className="flex h-9 w-20 shrink-0 items-center justify-start overflow-hidden">
              <Image
                alt="PiMed"
                className="h-full w-full object-contain object-left"
                height={423}
                priority
                src="/pimed-header-logo.png"
                width={858}
              />
            </span>
            
            <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 sm:inline">{hospitalContext.branch}</span>
          </div>
        </div>
        <CommandSearch />
        <RoleSwitcher className="hidden sm:flex" />
        <NotificationPopover />
        <Button asChild size="icon" variant="outline" aria-label="Open UI settings">
          <Link href="/settings/ui">
            <ShieldCheck className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
