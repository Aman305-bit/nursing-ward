"use client";

import * as React from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { searchResults } from "@/data/mock";

export function SearchPage() {
  const [query, setQuery] = React.useState("");
  const filtered = query
    ? searchResults.filter((result) => `${result.title} ${result.description} ${result.meta}`.toLowerCase().includes(query.toLowerCase()))
    : searchResults;
  const showLoadingState = query.length === 1;
  const recentSearches = searchResults.slice(0, 4);
  const groups = Array.from(new Set(filtered.map((result) => result.type)));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Global Search"
        description="Find clinical records, appointments, radiology reports, and actions from one workspace."
        eyebrow="Phase 1 / Command palette foundation"
      />

      <Card className="mt-4">
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="h-11 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by UHID, patient, doctor, clinical module, or radiology report..." />
          </div>

          {showLoadingState ? (
            <div className="space-y-2 rounded-lg border border-border p-3" aria-live="polite" aria-label="Search loading state">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="h-10 w-3/5" />
            </div>
          ) : !filtered.length ? (
            <EmptyState icon={Search} title="No matching records" description="Try a UHID, doctor name, clinical module, or radiology report number." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                {groups.map((group) => (
                  <Card key={group}>
                    <CardHeader>
                      <CardTitle>{group}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {filtered
                        .filter((result) => result.type === group)
                        .map((result) => (
                          <Link
                            className="flex items-center gap-3 rounded-lg border border-border p-3 transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            href={result.route}
                            key={result.id}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                              {result.type.slice(0, 2)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-foreground">{result.title}</div>
                              <div className="truncate text-xs text-muted-foreground">{result.description}</div>
                            </div>
                            <Badge tone="muted">{result.meta}</Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Popular Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="mb-3 rounded-lg border border-border bg-surface-muted p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent searches</div>
                    <div className="mt-2 space-y-1">
                      {recentSearches.map((item) => (
                        <Link className="block truncate text-sm text-foreground hover:text-primary" href={item.route} key={item.id}>
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                  {["Register patient", "Create appointment", "Open OPD queue", "Review radiology reports"].map((action) => (
                    <Button className="w-full justify-start" variant="outline" key={action}>
                      <Sparkles className="h-4 w-4" />
                      {action}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
