"use client";

import * as React from "react";

import { roles } from "@/data/navigation";
import type { Role } from "@/types";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  roles: Role[];
};

const RoleContext = React.createContext<RoleContextValue | null>(null);

function readSavedRole(): Role {
  const saved = window.localStorage.getItem("plasmit-role");
  return saved && roles.includes(saved as Role) ? (saved as Role) : "Hospital Admin";
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>("Hospital Admin");

  React.useEffect(() => {
    setRoleState(readSavedRole());
  }, []);

  const setRole = React.useCallback((nextRole: Role) => {
    setRoleState(nextRole);
    window.localStorage.setItem("plasmit-role", nextRole);
  }, []);

  const value = React.useMemo(() => ({ role, setRole, roles }), [role, setRole]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = React.useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used inside RoleProvider");
  }
  return context;
}
