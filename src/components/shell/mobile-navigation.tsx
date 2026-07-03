"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRole } from "@/components/providers/role-provider";
import { RoleSwitcher } from "@/components/shell/role-switcher";
import { getNavigationItemsForRole } from "@/data/navigation";
import { cn } from "@/lib/utils";
import type { NavigationChildItem } from "@/types";

function childIsActive(child: NavigationChildItem, pathname: string): boolean {
  if (child.children?.length) {
    return pathname === child.route || child.children.some((nested) => childIsActive(nested, pathname));
  }

  return pathname === child.route
    || (child.route !== "/" && pathname.startsWith(`${child.route}/`));
}

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { role } = useRole();
  const visibleItems = getNavigationItemsForRole(role);

  function renderChild(child: NavigationChildItem, depth = 0) {
    const hasNestedChildren = Boolean(child.children?.length);
    const active = childIsActive(child, pathname);

    if (hasNestedChildren) {
      return (
        <details open={active || undefined} key={child.id}>
          <summary
            className={cn(
              "group flex min-h-9 w-full cursor-pointer list-none items-center rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition duration-150 [&::-webkit-details-marker]:hidden",
              depth > 0 && "text-[11px]",
              active ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100" : "hover:bg-sky-50 hover:text-sky-700",
            )}
          >
            <span className="min-w-0 flex-1 text-left">{child.label}</span>
            <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
          </summary>
          <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-2">
            {child.children?.map((nested) => renderChild(nested, depth + 1))}
          </div>
        </details>
      );
    }

    return (
      <Link
        className={cn(
          "flex min-h-9 items-center rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition duration-150",
          active ? "bg-primary text-white shadow-[0_10px_22px_rgba(104,120,232,0.18)]" : "hover:bg-sky-50 hover:text-sky-700",
        )}
        href={child.route}
        key={child.id}
        onClick={() => setOpen(false)}
      >
        {child.label}
      </Link>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className="lg:hidden" size="icon" variant="outline" aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-slate-900/25 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-[90] flex w-[min(88vw,380px)] flex-col border-r border-slate-200 bg-white text-slate-900 shadow-[18px_0_40px_rgba(15,23,42,0.16)] outline-none">
          <div className="border-b border-slate-100 bg-white px-3 py-4">
            <div className="flex h-[72px] items-center justify-between bg-white">
              <Dialog.Title className="sr-only">Plasmit Healthcare IT Vector navigation</Dialog.Title>
              <Dialog.Description className="sr-only">Mobile navigation</Dialog.Description>
              <Image
                alt="Plasmit Healthcare IT Vector"
                className="h-full min-w-0 flex-1 object-contain object-left"
                height={352}
                priority
                src="/plasmit-sidebar-logo.webp"
                width={792}
              />
              <Dialog.Close asChild>
                <Button size="icon" variant="ghost" aria-label="Close navigation">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>
          <div className="border-b border-slate-100 p-3">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Active role</div>
            <RoleSwitcher className="w-full border-slate-200 bg-white text-slate-900 hover:bg-sky-50" />
          </div>
          <nav className="min-h-0 flex-1 overflow-auto p-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = Boolean(item.children?.length);
              const childActive = item.children?.some((child) => childIsActive(child, pathname)) ?? false;
              const active = pathname === item.route || childActive || (item.route !== "/dashboard" && pathname.startsWith(`${item.route}/`));

              if (hasChildren) {
                return (
                  <details open={active || undefined} key={item.id}>
                    <summary
                      className={cn(
                        "group flex min-h-11 w-full cursor-pointer list-none items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 transition duration-150 [&::-webkit-details-marker]:hidden",
                        active ? "bg-primary text-white shadow-[0_12px_24px_rgba(104,120,232,0.2)]" : "hover:bg-sky-50 hover:text-sky-700",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="min-w-0 flex-1 text-left">{item.label}</span>
                      <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                    </summary>
                    <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-2">
                      {item.children?.map((child) => renderChild(child))}
                    </div>
                  </details>
                );
              }

              return (
                <Link
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 transition duration-150",
                    active ? "bg-primary text-white shadow-[0_12px_24px_rgba(104,120,232,0.2)]" : "hover:bg-sky-50 hover:text-sky-700",
                  )}
                  href={item.route}
                  key={item.id}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
