import { Badge } from "@/components/ui/badge";
import type { StatusTone } from "@/types";

export function StatusPill({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  return <Badge tone={tone}>{children}</Badge>;
}
