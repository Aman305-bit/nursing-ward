"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">{children}</div>;
}

type ClinicalInformationPanelProps = {
  problems: string[];
  problemListVisible?: boolean;
  activeProblemView?: "Active" | "Find";
  newProblem?: string;
  onNewProblemChange?: (value: string) => void;
  onActiveProblemViewChange?: (value: "Active" | "Find") => void;
  onReorderPrevious?: (historyId: string) => void;
  historyOptions: Array<{ id: string; label: string }>;
};

export function ClinicalInformationPanel({
  problems,
  problemListVisible = true,
  activeProblemView = "Active",
  newProblem = "",
  onNewProblemChange = () => {},
  onActiveProblemViewChange = () => {},
  onReorderPrevious = () => {},
  historyOptions,
}: ClinicalInformationPanelProps) {
  const filteredProblems = React.useMemo(() => {
    const query = newProblem.trim().toLowerCase();
    if (activeProblemView !== "Find") return problems;
    if (!query) return problems;
    return problems.filter((problem) => problem.toLowerCase().includes(query));
  }, [activeProblemView, newProblem, problems]);

  return (
    <div className="grid gap-3">
      <Card className="min-w-0 overflow-hidden border-border">
        <CardContent className="space-y-3 p-3">
          <div className="flex items-center gap-2">
            <SectionTitle>Clinical Diagnosis</SectionTitle>
            <div className="ml-auto flex overflow-hidden border border-input bg-surface-muted">
              {(["Active", "Find"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={[
                    "border-l border-input px-3 py-1 text-xs font-medium first:border-l-0",
                    activeProblemView === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  ].join(" ")}
                  onClick={() => onActiveProblemViewChange(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          {activeProblemView === "Find" ? (
            <Input placeholder="Search problem..." value={newProblem} onChange={(event) => onNewProblemChange(event.target.value)} />
          ) : null}
          <div className="max-h-[220px] overflow-x-auto overflow-y-auto border border-border">
            <table className="min-w-[520px] w-full text-xs">
              <thead className="bg-surface-muted text-muted-foreground">
                <tr>
                  <th className="border-r border-border px-2 py-2 text-left">Date</th>
                  <th className="border-r border-border px-2 py-2 text-left">Clinical Dx</th>
                  <th className="px-2 py-2 text-left">Code</th>
                </tr>
              </thead>
              <tbody>
                {(problemListVisible ? filteredProblems : []).slice(0, 4).map((problem, index) => (
                  <tr key={problem} className={index % 2 === 0 ? "bg-background" : "bg-surface-muted/40"}>
                    <td className="border-t border-r border-border px-2 py-2 text-muted-foreground">12 May 2026</td>
                    <td className="border-t border-r border-border px-2 py-2 text-foreground">{problem}</td>
                    <td className="border-t border-border px-2 py-2 text-muted-foreground">-</td>
                  </tr>
                ))}
                {problemListVisible && filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="border-t border-border px-2 py-4 text-center text-muted-foreground">
                      {activeProblemView === "Find" && newProblem.trim() ? "No matching problems found" : "No problems reported"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden border-border">
        <CardContent className="space-y-3 p-3">
          <SectionTitle>Reorder from previous tests</SectionTitle>
          <div className="max-h-[180px] overflow-x-auto overflow-y-auto border border-border">
            <table className="min-w-[520px] w-full text-xs">
              <thead className="bg-surface-muted text-muted-foreground">
                <tr>
                  <th className="border-r border-border px-2 py-2 text-left">Date</th>
                  <th className="border-r border-border px-2 py-2 text-left">Test Name</th>
                  <th className="px-2 py-2 text-left">Options</th>
                </tr>
              </thead>
              <tbody>
                {historyOptions.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-background" : "bg-surface-muted/40"}>
                    <td className="border-t border-r border-border px-2 py-2 text-muted-foreground">{item.label.split("(")[1]?.replace(")", "") ?? "-"}</td>
                    <td className="border-t border-r border-border px-2 py-2 font-medium text-foreground">{item.label.split(" (")[0]}</td>
                    <td className="border-t border-border px-2 py-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => onReorderPrevious(item.id)}>
                        Reorder
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
