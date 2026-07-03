"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { useRole } from "@/components/providers/role-provider";
import {
  canAccessNursingIcuRoute,
  getDefaultNursingIcuRoute,
  getNursingRolePermission,
} from "@/data/icu-nursing-role-permissions";

export function IcuNursingRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useRole();
  const [tab, setTab] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTab(new URLSearchParams(window.location.search).get("tab"));
  }, [pathname]);

  const allowed = canAccessNursingIcuRoute(role, pathname, tab);
  const permission = getNursingRolePermission(role);

  if (allowed || !permission) {
    return <>{children}</>;
  }

  const defaultRoute = getDefaultNursingIcuRoute(role);

  return (
    <section className="mx-auto flex min-h-[55vh] max-w-3xl items-center justify-center">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">Role access</p>
        <h1 className="mt-2 text-xl font-black text-slate-950">{permission.role} workspace only</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This screen belongs to another nursing role. Open the assigned workspace for the active role.
        </p>
        <Link
          href={defaultRoute}
          className="mt-5 inline-flex h-10 items-center rounded-md bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700"
        >
          Open {permission.role} workspace
        </Link>
      </div>
    </section>
  );
}
