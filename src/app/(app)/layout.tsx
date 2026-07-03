import { AppShell } from "@/components/shell/app-shell";

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
