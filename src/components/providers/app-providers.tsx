"use client";

import { Toaster } from "sonner";

import { RoleProvider } from "@/components/providers/role-provider";
import { UiPreferenceProvider } from "@/components/providers/ui-preference-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UiPreferenceProvider>
      <RoleProvider>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </RoleProvider>
    </UiPreferenceProvider>
  );
}
