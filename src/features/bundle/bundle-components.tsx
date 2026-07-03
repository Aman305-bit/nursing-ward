"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Copy } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type ComponentShowcaseItem = {
  title: string;
  description?: string;
  preview: React.ReactNode;
  code: string;
  usageNote?: string;
};

export type ComponentVariantSectionItem = {
  title: string;
  description?: string;
  items: ComponentShowcaseItem[];
};

export function CodeBlock({ code, language = "tsx" }: { code: string; language?: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      toast.success("Code copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-2">
        <span className="text-xs font-medium uppercase text-slate-400">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100 transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 text-sm leading-6 text-slate-100">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

export function ComponentShowcase({ title, description, preview, code, usageNote }: ComponentShowcaseItem) {
  return (
    <section className="rounded-lg border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-border bg-surface-muted p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Live Preview</p>
          <div className="flex min-h-[150px] items-center justify-center rounded-lg border border-border bg-surface p-4">
            {preview}
          </div>
        </div>

        <div className="min-w-0">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Copyable Code</p>
          <CodeBlock code={code} />
        </div>
      </div>

      {usageNote ? (
        <div className="border-t border-border bg-info/5 px-4 py-3 text-sm text-info">
          {usageNote}
        </div>
      ) : null}
    </section>
  );
}

export function BundlePageHeader({
  title,
  subtitle,
  breadcrumb,
  category,
  count,
}: {
  title: string;
  subtitle: string;
  breadcrumb: string[];
  category?: string;
  count?: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {breadcrumb.map((crumb, index) => (
          <React.Fragment key={`${crumb}-${index}`}>
            {index ? <ChevronRight className="h-3.5 w-3.5" /> : null}
            {index === 0 ? <Link className="hover:text-foreground" href="/dashboard">{crumb}</Link> : index === 1 ? <Link className="hover:text-foreground" href="/bundle">{crumb}</Link> : <span className="font-medium text-foreground">{crumb}</span>}
          </React.Fragment>
        ))}
      </div>
      <PageHeader
        eyebrow={category ? `Bundle / ${category}` : "Bundle"}
        title={title}
        description={subtitle}
        actions={<>{typeof count === "number" ? <Badge tone="info">{count} examples</Badge> : null}<Button variant="outline" asChild><Link href="/bundle">Bundle Home</Link></Button></>}
      />
    </div>
  );
}

export function ComponentVariantSection({ title, description, items }: ComponentVariantSectionItem) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        <Badge tone="muted">{items.length} variants</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => <ComponentShowcase key={item.title} {...item} />)}
      </CardContent>
    </Card>
  );
}
