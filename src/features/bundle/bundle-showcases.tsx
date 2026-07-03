"use client";

import * as React from "react";
import {
  AlertCircle,
  Bell,
  CalendarClock,
  Check,
  CreditCard,
  Download,
  FileText,
  FlaskConical,
  HeartPulse,
  Hospital,
  IdCard,
  ImageUp,
  Loader2,
  MoreHorizontal,
  Package,
  Pill,
  Printer,
  Save,
  Search,
  Settings,
  Upload,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fieldClass, type BundleItem } from "@/features/bundle/bundle-types";
import type { ComponentVariantSectionItem } from "@/features/bundle/bundle-components";
import { cn } from "@/lib/utils";

const chartData = [
  { name: "Mon", visits: 120, revenue: 42, lab: 34 },
  { name: "Tue", visits: 148, revenue: 51, lab: 45 },
  { name: "Wed", visits: 138, revenue: 47, lab: 39 },
  { name: "Thu", visits: 176, revenue: 62, lab: 58 },
  { name: "Fri", visits: 190, revenue: 71, lab: 64 },
  { name: "Sat", visits: 164, revenue: 56, lab: 49 },
];

const pieData = [
  { name: "OPD", value: 48 },
  { name: "IPD", value: 22 },
  { name: "Emergency", value: 16 },
  { name: "Follow-up", value: 14 },
];

const chartColors = ["#2563eb", "#16a34a", "#0891b2", "#ca8a04"];

function componentName(value: string) {
  return value.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(" ").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("") || "BundleComponent";
}

function bundleIconName(itemId: string) {
  if (itemId.includes("patient")) return "IdCard";
  if (itemId.includes("hospital")) return "Hospital";
  if (itemId.includes("billing")) return "CreditCard";
  if (itemId.includes("pharmacy")) return "Pill";
  if (itemId.includes("lab")) return "FlaskConical";
  if (itemId.includes("timeline")) return "CalendarClock";
  if (itemId.includes("upload")) return "ImageUp";
  if (itemId.includes("settings")) return "Settings";
  return "Package";
}

function sampleCardCode(title: string, icon = "Package", badge = "Ready") {
  const name = componentName(title);
  return `import { ${icon} } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ${name}() {
  return (
    <Card>
      <CardHeader>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-muted">
          <${icon} className="h-4 w-4 text-primary" />
        </div>
        <Badge tone="info">${badge}</Badge>
      </CardHeader>
      <CardContent>
        <CardTitle>${title}</CardTitle>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Reusable hospital/admin UI card built with existing design tokens.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline">View</Button>
          <Button size="sm">Use</Button>
        </div>
      </CardContent>
    </Card>
  );
}`;
}

function cardPreview(title: string, Icon = Package, badge = "Ready") {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-muted">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <Badge tone="info">{badge}</Badge>
      </CardHeader>
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Reusable hospital/admin UI card built with existing design tokens.</p>
        <div className="mt-3 flex gap-2"><Button size="sm" variant="outline">View</Button><Button size="sm">Use</Button></div>
      </CardContent>
    </Card>
  );
}

function buttonCode(name: string, jsx: string) {
  return `import { Button } from "@/components/ui/button";

export function ${name}() {
  return (
    ${jsx}
  );
}`;
}

function buttonsSection(): ComponentVariantSectionItem {
  const items = [
    ["Primary Button", "Standard action button used for save, submit, continue actions.", <Button key="primary">Primary Button</Button>, buttonCode("PrimaryButton", `<Button>Primary Button</Button>`)],
    ["Secondary Button", "Lower emphasis action for alternate commands.", <Button key="secondary" variant="secondary">Secondary Button</Button>, buttonCode("SecondaryButton", `<Button variant="secondary">Secondary Button</Button>`)],
    ["Outline Button", "Neutral button for cancel, view, print, and secondary actions.", <Button key="outline" variant="outline">Outline Button</Button>, buttonCode("OutlineButton", `<Button variant="outline">Outline Button</Button>`)],
    ["Ghost Button", "Lightweight action for toolbar and inline commands.", <Button key="ghost" variant="ghost">Ghost Button</Button>, buttonCode("GhostButton", `<Button variant="ghost">Ghost Button</Button>`)],
    ["Danger Button", "Destructive action button for delete/cancel workflows.", <Button key="danger" variant="danger">Danger Button</Button>, buttonCode("DangerButton", `<Button variant="danger">Danger Button</Button>`)],
    ["Success Button", "Positive completion action for approve/mark ready flows.", <Button key="success" className="bg-success text-success-foreground hover:brightness-95">Success Button</Button>, buttonCode("SuccessButton", `<Button className="bg-success text-success-foreground hover:brightness-95">Success Button</Button>`)],
    ["Warning Button", "Attention action for review/escalation flows.", <Button key="warning" className="bg-warning text-warning-foreground hover:brightness-95">Warning Button</Button>, buttonCode("WarningButton", `<Button className="bg-warning text-warning-foreground hover:brightness-95">Warning Button</Button>`)],
    ["Loading Button", "Use while saving, uploading, or submitting.", <Button key="loading" disabled><Loader2 className="h-4 w-4 animate-spin" />Loading</Button>, `import { Loader2 } from "lucide-react";\n\nimport { Button } from "@/components/ui/button";\n\nexport function LoadingButton() {\n  return <Button disabled><Loader2 className="h-4 w-4 animate-spin" />Loading</Button>;\n}`],
    ["Icon Button", "Compact icon action for table/toolbars.", <Button key="icon" size="icon" variant="outline" aria-label="Add"><Save className="h-4 w-4" /></Button>, `import { Save } from "lucide-react";\n\nimport { Button } from "@/components/ui/button";\n\nexport function IconButton() {\n  return <Button size="icon" variant="outline" aria-label="Save"><Save className="h-4 w-4" /></Button>;\n}`],
    ["Save Button", "Standard save action.", <Button key="save"><Save className="h-4 w-4" />Save</Button>, `import { Save } from "lucide-react";\n\nimport { Button } from "@/components/ui/button";\n\nexport function SaveButton() {\n  return <Button><Save className="h-4 w-4" />Save</Button>;\n}`],
    ["Cancel Button", "Standard cancel action.", <Button key="cancel" variant="outline"><X className="h-4 w-4" />Cancel</Button>, `import { X } from "lucide-react";\n\nimport { Button } from "@/components/ui/button";\n\nexport function CancelButton() {\n  return <Button variant="outline"><X className="h-4 w-4" />Cancel</Button>;\n}`],
    ["Print Button", "Print bills, prescriptions, or reports.", <Button key="print" variant="outline"><Printer className="h-4 w-4" />Print</Button>, `import { Printer } from "lucide-react";\n\nimport { Button } from "@/components/ui/button";\n\nexport function PrintButton() {\n  return <Button variant="outline"><Printer className="h-4 w-4" />Print</Button>;\n}`],
    ["Export Button", "Export table/report data.", <Button key="export" variant="outline"><Download className="h-4 w-4" />Export</Button>, `import { Download } from "lucide-react";\n\nimport { Button } from "@/components/ui/button";\n\nexport function ExportButton() {\n  return <Button variant="outline"><Download className="h-4 w-4" />Export</Button>;\n}`],
    ["Upload Button", "Upload patient documents or reports.", <Button key="upload" variant="outline"><Upload className="h-4 w-4" />Upload</Button>, `import { Upload } from "lucide-react";\n\nimport { Button } from "@/components/ui/button";\n\nexport function UploadButton() {\n  return <Button variant="outline"><Upload className="h-4 w-4" />Upload</Button>;\n}`],
  ];
  return { title: "Button Variants", description: "Copy-paste ready button variants using the existing Button component.", items: items.map(([title, description, preview, code]) => ({ title: title as string, description: description as string, preview, code: code as string })) };
}

function fieldPreview(label: string, children: React.ReactNode) {
  return <label className="w-full max-w-sm space-y-1.5"><span className="text-xs font-medium text-foreground">{label}</span>{children}</label>;
}

function inputsSection(): ComponentVariantSectionItem {
  const inputImport = `import { Input } from "@/components/ui/input";`;
  const items = [
    ["Text Input", fieldPreview("Patient name", <Input placeholder="Aisha Khan" />), `${inputImport}\n\nexport function TextInput() {\n  return <Input placeholder="Patient name" />;\n}`],
    ["Email Input", fieldPreview("Email", <Input type="email" placeholder="patient@example.com" />), `${inputImport}\n\nexport function EmailInput() {\n  return <Input type="email" placeholder="patient@example.com" />;\n}`],
    ["Password Input", fieldPreview("Password", <Input type="password" placeholder="Password" />), `${inputImport}\n\nexport function PasswordInput() {\n  return <Input type="password" placeholder="Password" />;\n}`],
    ["Phone Input", fieldPreview("Phone", <Input type="tel" placeholder="9876543210" />), `${inputImport}\n\nexport function PhoneInput() {\n  return <Input type="tel" placeholder="9876543210" />;\n}`],
    ["Search Input", <div key="search" className="relative w-full max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search patient, UHID..." /></div>, `import { Search } from "lucide-react";\n\nimport { Input } from "@/components/ui/input";\n\nexport function SearchInput() {\n  return <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search patient, UHID..." /></div>;\n}`],
    ["Select Input", fieldPreview("Department", <select className={fieldClass}><option>Cardiology</option><option>Pediatrics</option></select>), `import { fieldClass } from "@/features/bundle/bundle-types";\n\nexport function SelectInput() {\n  return <select className={fieldClass}><option>Cardiology</option><option>Pediatrics</option></select>;\n}`],
    ["Textarea", fieldPreview("Clinical note", <textarea className={cn(fieldClass, "h-24")} placeholder="Enter note" />), `import { cn } from "@/lib/utils";\nimport { fieldClass } from "@/features/bundle/bundle-types";\n\nexport function TextareaInput() {\n  return <textarea className={cn(fieldClass, "h-24")} placeholder="Enter note" />;\n}`],
    ["Checkbox", <label key="check" className="flex items-center gap-2 text-sm"><input type="checkbox" /> Patient consent received</label>, `export function CheckboxInput() {\n  return <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Patient consent received</label>;\n}`],
    ["Radio", <label key="radio" className="flex items-center gap-2 text-sm"><input type="radio" name="visit" /> OPD Visit</label>, `export function RadioInput() {\n  return <label className="flex items-center gap-2 text-sm"><input type="radio" name="visit" /> OPD Visit</label>;\n}`],
    ["Toggle Switch", <label key="toggle" className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> SMS alerts</label>, `export function ToggleSwitch() {\n  return <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> SMS alerts</label>;\n}`],
    ["Input with Icon", <div key="icon-input" className="relative w-full max-w-sm"><CalendarClock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Appointment time" /></div>, `import { CalendarClock } from "lucide-react";\n\nimport { Input } from "@/components/ui/input";\n\nexport function InputWithIcon() {\n  return <div className="relative"><CalendarClock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Appointment time" /></div>;\n}`],
    ["Error Input", fieldPreview("Mobile", <Input className="border-danger focus:border-danger focus:ring-danger/20" placeholder="Invalid mobile" />), `${inputImport}\n\nexport function ErrorInput() {\n  return <Input className="border-danger focus:border-danger focus:ring-danger/20" placeholder="Invalid mobile" />;\n}`],
    ["Success Input", fieldPreview("UHID", <Input className="border-success focus:border-success focus:ring-success/20" value="UHID-240221" readOnly />), `${inputImport}\n\nexport function SuccessInput() {\n  return <Input className="border-success focus:border-success focus:ring-success/20" value="UHID-240221" readOnly />;\n}`],
  ];
  return { title: "Input Variants", description: "All common input controls with copyable code.", items: items.map(([title, preview, code]) => ({ title: title as string, description: `${title} reusable input pattern.`, preview, code: code as string })) };
}

function formsSection(): ComponentVariantSectionItem {
  const formNames = ["Basic Form", "Two Column Form", "Patient Registration Form", "Appointment Form", "Billing Form", "Pharmacy Item Form", "Lab Test Form", "Validation Error Form"];
  return {
    title: "Form Layouts",
    description: "Reusable form layouts for hospital workflows.",
    items: formNames.map((title) => ({
      title,
      description: `${title} with labels, helper text, and existing Input/Button components.`,
      preview: (
        <form className="grid w-full max-w-xl gap-3 md:grid-cols-2">
          <label className="space-y-1.5"><span className="text-xs font-medium">Patient name</span><Input placeholder="Aisha Khan" /></label>
          <label className="space-y-1.5"><span className="text-xs font-medium">Department</span><select className={fieldClass}><option>Cardiology</option></select></label>
          <label className="space-y-1.5 md:col-span-2"><span className="text-xs font-medium">Notes</span><textarea className={cn(fieldClass, "h-20")} placeholder="Clinical notes" /></label>
          <div className="flex gap-2 md:col-span-2"><Button>Save</Button><Button variant="outline">Cancel</Button></div>
        </form>
      ),
      code: `"use client";\n\nimport { Button } from "@/components/ui/button";\nimport { Input } from "@/components/ui/input";\nimport { fieldClass } from "@/features/bundle/bundle-types";\nimport { cn } from "@/lib/utils";\n\nexport function ${componentName(title)}() {\n  return (\n    <form className="grid gap-3 md:grid-cols-2">\n      <label className="space-y-1.5"><span className="text-xs font-medium">Patient name</span><Input placeholder="Aisha Khan" /></label>\n      <label className="space-y-1.5"><span className="text-xs font-medium">Department</span><select className={fieldClass}><option>Cardiology</option></select></label>\n      <label className="space-y-1.5 md:col-span-2"><span className="text-xs font-medium">Notes</span><textarea className={cn(fieldClass, "h-20")} placeholder="Clinical notes" /></label>\n      <div className="flex gap-2 md:col-span-2"><Button>Save</Button><Button variant="outline">Cancel</Button></div>\n    </form>\n  );\n}`,
    })),
  };
}

function cardsSection(): ComponentVariantSectionItem {
  const cards = [
    ["Stats Card", HeartPulse, "HeartPulse", "Live"],
    ["Patient Card", IdCard, "IdCard", "Active"],
    ["Doctor Card", HeartPulse, "HeartPulse", "Available"],
    ["Appointment Card", CalendarClock, "CalendarClock", "Today"],
    ["Billing Summary Card", CreditCard, "CreditCard", "Paid"],
    ["Pharmacy Stock Card", Pill, "Pill", "Low stock"],
    ["Lab Report Card", FlaskConical, "FlaskConical", "Ready"],
    ["Alert Card", AlertCircle, "AlertCircle", "Critical"],
    ["Action Card", MoreHorizontal, "MoreHorizontal", "Actions"],
  ] as const;
  return { title: "Card Components", description: "Copy-paste ready card patterns.", items: cards.map(([title, Icon, iconName, badge]) => ({ title, description: `${title} for hospital dashboard screens.`, preview: cardPreview(title, Icon, badge), code: sampleCardCode(title, iconName, badge) })) };
}

function tablePreview(title: string) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-surface-muted text-xs uppercase text-muted-foreground"><tr><th className="p-2">Token</th><th className="p-2">Patient</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead>
        <tbody><tr className="border-t border-border"><td className="p-2">OPD-014</td><td className="p-2">Aisha Khan</td><td className="p-2"><Badge tone="warning">Waiting</Badge></td><td className="p-2"><Button size="sm" variant="outline">View</Button></td></tr></tbody>
      </table>
    </div>
  );
}

function tablesSection(): ComponentVariantSectionItem {
  const names = ["Basic Table", "Patient Table", "Appointment Table", "Billing Table", "Pharmacy Stock Table", "Lab Test Table", "Table with Search", "Table with Filter", "Table with Pagination", "Table with Action Dropdown"];
  return { title: "Table Components", description: "Responsive tables with badges, filters, and actions.", items: names.map((title) => ({ title, description: `${title} reusable table pattern.`, preview: tablePreview(title), code: `import { Badge } from "@/components/ui/badge";\nimport { Button } from "@/components/ui/button";\n\nexport function ${componentName(title)}() {\n  return (\n    <div className="overflow-x-auto rounded-lg border border-border bg-surface">\n      <table className="w-full min-w-[480px] text-left text-sm">\n        <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">\n          <tr><th className="p-2">Token</th><th className="p-2">Patient</th><th className="p-2">Status</th><th className="p-2">Action</th></tr>\n        </thead>\n        <tbody>\n          <tr className="border-t border-border"><td className="p-2">OPD-014</td><td className="p-2">Aisha Khan</td><td className="p-2"><Badge tone="warning">Waiting</Badge></td><td className="p-2"><Button size="sm" variant="outline">View</Button></td></tr>\n        </tbody>\n      </table>\n    </div>\n  );\n}` })) };
}

function chartPreview(type: "line" | "bar" | "area" | "pie") {
  if (type === "pie") {
    return <div className="h-56 w-full"><ResponsiveContainer width="100%" height="100%" minWidth={0}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78}>{pieData.map((row, index) => <Cell key={row.name} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>;
  }
  const Chart = type === "line" ? LineChart : type === "bar" ? BarChart : AreaChart;
  return <div className="h-56 w-full"><ResponsiveContainer width="100%" height="100%" minWidth={0}><Chart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip />{type === "line" ? <Line dataKey="visits" stroke="#2563eb" strokeWidth={2} /> : type === "bar" ? <Bar dataKey="visits" fill="#2563eb" radius={[6, 6, 0, 0]} /> : <Area dataKey="revenue" fill="#16a34a33" stroke="#16a34a" />}</Chart></ResponsiveContainer></div>;
}

function chartsSection(): ComponentVariantSectionItem {
  const charts: Array<[string, "line" | "bar" | "area" | "pie"]> = [["Line Chart Card", "line"], ["Bar Chart Card", "bar"], ["Pie Chart Card", "pie"], ["Donut Chart Card", "pie"], ["Revenue Chart", "area"], ["Patient Visit Chart", "line"], ["Appointment Status Chart", "pie"], ["Pharmacy Sales Chart", "bar"], ["Lab Test Volume Chart", "bar"], ["Billing Collection Chart", "area"]];
  return { title: "Charts and Graphs", description: "Working Recharts examples using existing project dependency.", items: charts.map(([title, type]) => ({ title, description: `${title} for dashboard analytics.`, preview: chartPreview(type), code: `"use client";\n\nimport { ResponsiveContainer, ${type === "pie" ? "PieChart, Pie, Cell, Tooltip" : type === "bar" ? "BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis" : type === "line" ? "LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis" : "AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis"} } from "recharts";\n\nconst data = ${type === "pie" ? JSON.stringify(pieData, null, 2) : JSON.stringify(chartData, null, 2)};\n\nexport function ${componentName(title)}() {\n  return (\n    <div className="h-64 rounded-lg border border-border bg-surface p-4">\n      <ResponsiveContainer width="100%" height="100%" minWidth={0}>\n        ${type === "pie" ? `<PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} /><Tooltip /></PieChart>` : type === "bar" ? `<BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="visits" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart>` : type === "line" ? `<LineChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line dataKey="visits" stroke="#2563eb" strokeWidth={2} /></LineChart>` : `<AreaChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area dataKey="revenue" fill="#16a34a33" stroke="#16a34a" /></AreaChart>`}\n      </ResponsiveContainer>\n    </div>\n  );\n}` })) };
}

function genericSections(item: BundleItem): ComponentVariantSectionItem[] {
  return (item.sections ?? []).map((section) => ({
    title: section.title,
    description: section.description,
    items: section.examples.map((example) => ({
      title: example,
      description: `${example} reusable UI block.`,
      preview: cardPreview(example, item.icon, item.category),
      code: sampleCardCode(example, bundleIconName(item.id), item.category),
    })),
  }));
}

function badgeSections(): ComponentVariantSectionItem[] {
  const statuses = [
    ["Active", "success"], ["Inactive", "muted"], ["Pending", "warning"], ["Approved", "success"], ["Rejected", "danger"], ["Completed", "success"], ["Cancelled", "danger"],
    ["Paid", "success"], ["Unpaid", "danger"], ["Partial", "warning"], ["Critical", "critical"], ["Low stock", "warning"], ["Normal", "muted"], ["High priority", "critical"], ["Emergency", "danger"],
  ] as const;
  return [{ title: "Badge Variants", description: "Status badges for clinical, billing, pharmacy, and hospital workflows.", items: statuses.map(([label, tone]) => ({
    title: `${label} Badge`,
    description: `${label} status badge.`,
    preview: <Badge tone={tone}>{label}</Badge>,
    code: `import { Badge } from "@/components/ui/badge";\n\nexport function ${componentName(label)}Badge() {\n  return <Badge tone="${tone}">${label}</Badge>;\n}`,
  })) }];
}

function alertSections(): ComponentVariantSectionItem[] {
  const alerts = [
    ["Success Alert", "Saved successfully", "Patient profile has been updated.", "success", "Check"],
    ["Error Alert", "Unable to save", "Please fix validation errors and try again.", "danger", "AlertCircle"],
    ["Warning Alert", "Payment pending", "Clear payment before pharmacy dispense.", "warning", "AlertCircle"],
    ["Info Alert", "Report ready", "Lab report is ready for doctor review.", "info", "Bell"],
    ["Critical Alert", "Critical value", "Doctor review is required immediately.", "critical", "AlertCircle"],
  ] as const;
  return [{ title: "Alerts and Toasts", description: "Inline alert patterns with copyable code.", items: alerts.map(([title, heading, body, tone, icon]) => ({
    title,
    description: `${title} reusable feedback block.`,
    preview: <AlertBanner icon={icon === "Bell" ? Bell : icon === "Check" ? Check : AlertCircle} title={heading} tone={tone}>{body}</AlertBanner>,
    code: `import { ${icon} } from "lucide-react";\n\nimport { AlertBanner } from "@/components/ui/alert-banner";\n\nexport function ${componentName(title)}() {\n  return <AlertBanner icon={${icon}} title="${heading}" tone="${tone}">${body}</AlertBanner>;\n}`,
  })) }];
}

function modalSections(): ComponentVariantSectionItem[] {
  const names = ["Small Modal", "Medium Modal", "Large Modal", "Confirmation Modal", "Delete Modal", "Form Modal", "Patient Quick Add Modal", "Payment Modal", "Print Preview Modal", "Drawer Style Modal"];
  return [{ title: "Modal Variants", description: "Radix Dialog based modal examples.", items: names.map((title) => ({
    title,
    description: `${title} layout pattern.`,
    preview: <Button variant={title.includes("Delete") ? "danger" : "outline"}>{title}</Button>,
    code: `"use client";\n\nimport * as Dialog from "@radix-ui/react-dialog";\n\nimport { Button } from "@/components/ui/button";\n\nexport function ${componentName(title)}() {\n  return (\n    <Dialog.Root>\n      <Dialog.Trigger asChild><Button variant="outline">${title}</Button></Dialog.Trigger>\n      <Dialog.Portal>\n        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />\n        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-4 shadow-soft">\n          <Dialog.Title className="text-base font-semibold">${title}</Dialog.Title>\n          <Dialog.Description className="mt-1 text-sm text-muted-foreground">Reusable modal content goes here.</Dialog.Description>\n          <div className="mt-4 flex justify-end gap-2"><Dialog.Close asChild><Button variant="outline">Cancel</Button></Dialog.Close><Button>Confirm</Button></div>\n        </Dialog.Content>\n      </Dialog.Portal>\n    </Dialog.Root>\n  );\n}`,
  })) }];
}

function dropdownSections(): ComponentVariantSectionItem[] {
  const names = ["Basic Dropdown", "Action Dropdown", "Profile Dropdown", "Filter Dropdown", "Multi Action Menu", "Three-dot Table Action Menu"];
  return [{ title: "Dropdown Variants", description: "Simple copyable dropdown patterns.", items: names.map((title) => ({
    title,
    description: `${title} for menus and table actions.`,
    preview: <details className="relative"><summary className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">{title}</summary><div className="mt-2 w-44 rounded-md border border-border bg-surface p-2 shadow-sm"><button className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-surface-muted">View</button><button className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-surface-muted">Edit</button></div></details>,
    code: `export function ${componentName(title)}() {\n  return (\n    <details className="relative">\n      <summary className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 text-sm">${title}</summary>\n      <div className="mt-2 w-44 rounded-md border border-border bg-surface p-2 shadow-sm">\n        <button className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-surface-muted">View</button>\n        <button className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-surface-muted">Edit</button>\n      </div>\n    </details>\n  );\n}`,
  })) }];
}

function dateTimeSections(): ComponentVariantSectionItem[] {
  const fields = [["Date Picker", "date"], ["Time Picker", "time"], ["Date Range Picker", "date"], ["Appointment Date/Time Selector", "datetime-local"], ["DOB Selector", "date"], ["Follow-up Date Selector", "date"]] as const;
  return [{ title: "Date and Time Pickers", description: "Native date/time controls styled with existing input classes.", items: fields.map(([title, type]) => ({
    title,
    description: `${title} control.`,
    preview: fieldPreview(title, <Input type={type} />),
    code: `import { Input } from "@/components/ui/input";\n\nexport function ${componentName(title)}() {\n  return <Input type="${type}" />;\n}`,
  })) }];
}

function searchFilterSections(): ComponentVariantSectionItem[] {
  const names = ["Global Search Bar", "Table Search", "Advanced Filter Panel", "Status Filter", "Department Filter", "Doctor Filter", "Date Range Filter", "Reset Filter Button", "Applied Filter Chips"];
  return [{ title: "Search and Filter Components", description: "Search bars, filters, reset actions, and chips.", items: names.map((title) => ({
    title,
    description: `${title} reusable pattern.`,
    preview: <div className="w-full max-w-lg space-y-3"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search patient, UHID, bill..." /></div><div className="flex flex-wrap gap-2"><Badge tone="info">Status: Pending</Badge><Badge tone="muted">Department: OPD</Badge><Button size="sm" variant="outline">Reset</Button></div></div>,
    code: `import { Search } from "lucide-react";\n\nimport { Badge } from "@/components/ui/badge";\nimport { Button } from "@/components/ui/button";\nimport { Input } from "@/components/ui/input";\n\nexport function ${componentName(title)}() {\n  return <div className="space-y-3"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search patient, UHID, bill..." /></div><div className="flex flex-wrap gap-2"><Badge tone="info">Status: Pending</Badge><Badge tone="muted">Department: OPD</Badge><Button size="sm" variant="outline">Reset</Button></div></div>;\n}`,
  })) }];
}

function uploadSections(): ComponentVariantSectionItem[] {
  const names = ["Drag and Drop Upload", "Single File Upload", "Multiple File Upload", "Image Preview Upload", "PDF Upload Card", "Progress Upload Bar", "Uploaded File List", "Error File State"];
  return [{ title: "File Upload Components", description: "Upload boxes, progress bars, and file states.", items: names.map((title) => ({
    title,
    description: `${title} reusable upload UI.`,
    preview: <div className="w-full max-w-sm rounded-lg border border-dashed border-border bg-surface-muted p-6 text-center"><ImageUp className="mx-auto h-8 w-8 text-muted-foreground" /><div className="mt-2 text-sm font-semibold">{title}</div><Button className="mt-4" variant="outline"><Upload className="h-4 w-4" />Upload file</Button></div>,
    code: `import { ImageUp, Upload } from "lucide-react";\n\nimport { Button } from "@/components/ui/button";\n\nexport function ${componentName(title)}() {\n  return <div className="rounded-lg border border-dashed border-border bg-surface-muted p-6 text-center"><ImageUp className="mx-auto h-8 w-8 text-muted-foreground" /><div className="mt-2 text-sm font-semibold">${title}</div><Button className="mt-4" variant="outline"><Upload className="h-4 w-4" />Upload file</Button></div>;\n}`,
  })) }];
}

function stepperSections(): ComponentVariantSectionItem[] {
  const names = ["Basic Stepper", "Patient Registration Wizard", "Appointment Booking Wizard", "Billing Wizard", "Lab Test Order Wizard", "Step Completed Active Pending States"];
  return [{ title: "Stepper and Wizard Forms", description: "Multi-step flow components.", items: names.map((title) => ({
    title,
    description: `${title} copyable stepper pattern.`,
    preview: <div className="grid w-full max-w-lg grid-cols-3 gap-2">{["Patient", "Billing", "Done"].map((step, index) => <div className="rounded-lg border border-border bg-background p-3 text-center" key={step}><div className={cn("mx-auto grid h-7 w-7 place-items-center rounded-full text-xs", index === 0 ? "bg-success text-success-foreground" : index === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{index + 1}</div><div className="mt-2 text-xs font-medium">{step}</div></div>)}</div>,
    code: `import { cn } from "@/lib/utils";\n\nexport function ${componentName(title)}() {\n  const steps = ["Patient", "Billing", "Done"];\n  return <div className="grid grid-cols-3 gap-2">{steps.map((step, index) => <div className="rounded-lg border border-border bg-background p-3 text-center" key={step}><div className={cn("mx-auto grid h-7 w-7 place-items-center rounded-full text-xs", index === 0 ? "bg-success text-success-foreground" : index === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{index + 1}</div><div className="mt-2 text-xs font-medium">{step}</div></div>)}</div>;\n}`,
  })) }];
}

function timelineSections(): ComponentVariantSectionItem[] {
  const names = ["Patient Journey Timeline", "Appointment Activity Log", "Billing Activity Log", "Lab Sample Timeline", "Pharmacy Sales Timeline", "User Audit Log"];
  return [{ title: "Timeline and Activity Logs", description: "Vertical timeline components.", items: names.map((title) => ({
    title,
    description: `${title} reusable activity log.`,
    preview: <div className="w-full max-w-md space-y-3">{["Registered", "Vitals captured", "Doctor reviewed"].map((row, index) => <div className="flex gap-3" key={row}><div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{index + 1}</div><div className="rounded-md border border-border bg-background p-2 text-sm">{row}</div></div>)}</div>,
    code: `export function ${componentName(title)}() {\n  const rows = ["Registered", "Vitals captured", "Doctor reviewed"];\n  return <div className="space-y-3">{rows.map((row, index) => <div className="flex gap-3" key={row}><div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{index + 1}</div><div className="rounded-md border border-border bg-background p-2 text-sm">{row}</div></div>)}</div>;\n}`,
  })) }];
}

function settingsSections(): ComponentVariantSectionItem[] {
  const names = ["Profile Settings Form", "Hospital Settings Form", "Notification Settings", "Security Settings", "Theme Settings", "Role Permission UI", "Toggle Settings Rows"];
  return [{ title: "Settings UI", description: "Forms and toggle rows for settings screens.", items: names.map((title) => ({
    title,
    description: `${title} reusable settings pattern.`,
    preview: <div className="w-full max-w-md space-y-2"><div className="flex items-center justify-between rounded-lg border border-border bg-background p-3"><div><div className="text-sm font-medium">{title}</div><div className="text-xs text-muted-foreground">Configurable by admin</div></div><input type="checkbox" defaultChecked /></div></div>,
    code: `export function ${componentName(title)}() {\n  return <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3"><div><div className="text-sm font-medium">${title}</div><div className="text-xs text-muted-foreground">Configurable by admin</div></div><input type="checkbox" defaultChecked /></div>;\n}`,
  })) }];
}

function typographySections(): ComponentVariantSectionItem[] {
  const names = ["Heading Examples", "Paragraph Examples", "Label Text", "Helper Text", "Error Text", "Link Style", "Icon Button Examples", "Healthcare Icons Usage", "Admin Dashboard Icon Examples"];
  return [{ title: "Typography and Icons", description: "Text and icon style examples.", items: names.map((title) => ({
    title,
    description: `${title} copyable style.`,
    preview: title.includes("Icon") ? <Button size="icon" variant="outline"><Settings className="h-4 w-4" /></Button> : <div><h3 className="text-lg font-semibold text-foreground">{title}</h3><p className="mt-1 text-sm text-muted-foreground">Readable dashboard text style.</p></div>,
    code: title.includes("Icon") ? `import { Settings } from "lucide-react";\n\nimport { Button } from "@/components/ui/button";\n\nexport function ${componentName(title)}() {\n  return <Button size="icon" variant="outline"><Settings className="h-4 w-4" /></Button>;\n}` : `export function ${componentName(title)}() {\n  return <div><h3 className="text-lg font-semibold text-foreground">${title}</h3><p className="mt-1 text-sm text-muted-foreground">Readable dashboard text style.</p></div>;\n}`,
  })) }];
}

export function getBundleShowcaseSections(item: BundleItem): ComponentVariantSectionItem[] {
  switch (item.id) {
    case "buttons":
      return [buttonsSection()];
    case "forms":
      return [formsSection()];
    case "inputs":
      return [inputsSection()];
    case "cards":
      return [cardsSection()];
    case "tables":
      return [tablesSection()];
    case "charts":
      return [chartsSection()];
    case "modals":
      return modalSections();
    case "badges":
      return badgeSections();
    case "alerts":
      return alertSections();
    case "dropdowns":
      return dropdownSections();
    case "date-time":
      return dateTimeSections();
    case "search-filters":
      return searchFilterSections();
    case "file-upload":
      return uploadSections();
    case "stepper":
      return stepperSections();
    case "timeline":
      return timelineSections();
    case "settings-ui":
      return settingsSections();
    case "typography-icons":
      return typographySections();
    case "dashboard-widgets":
      return [{ title: "Dashboard Widgets", description: "KPI and workflow widgets.", items: [
        { title: "KPI Card", description: "Dashboard KPI card.", preview: <StatCard label="OPD visits" value={186} change="+8%" context="Today" tone="success" icon={HeartPulse} />, code: `import { HeartPulse } from "lucide-react";\nimport { StatCard } from "@/components/ui/stat-card";\n\nexport function KpiCard() {\n  return <StatCard label="OPD visits" value={186} change="+8%" context="Today" tone="success" icon={HeartPulse} />;\n}` },
        { title: "Recent Activity Card", description: "Recent activity widget.", preview: cardPreview("Recent activity", Bell, "Live"), code: sampleCardCode("Recent Activity Card", "Bell", "Live") },
        { title: "Low Stock Widget", description: "Pharmacy stock risk widget.", preview: cardPreview("Low stock widget", Pill, "Action"), code: sampleCardCode("Low Stock Widget", "Pill", "Action") },
      ] }];
    case "empty-loaders":
      return [{ title: "Empty States and Loaders", description: "Reusable empty/loading states.", items: [
        { title: "Empty Table State", description: "No data state.", preview: <EmptyState icon={Search} title="No records found" description="Try another search or reset filters." />, code: `import { Search } from "lucide-react";\nimport { EmptyState } from "@/components/ui/empty-state";\n\nexport function EmptyTableState() {\n  return <EmptyState icon={Search} title="No records found" description="Try another search or reset filters." />;\n}` },
        { title: "Card Skeleton", description: "Loading skeleton.", preview: <div className="w-full max-w-sm space-y-3"><Skeleton className="h-9 w-1/2" /><Skeleton className="h-28 w-full" /></div>, code: `import { Skeleton } from "@/components/ui/skeleton";\n\nexport function CardSkeleton() {\n  return <div className="space-y-3"><Skeleton className="h-9 w-1/2" /><Skeleton className="h-28 w-full" /></div>;\n}` },
        { title: "Button Loader", description: "Loading button.", preview: <Button disabled><Loader2 className="h-4 w-4 animate-spin" />Loading</Button>, code: `import { Loader2 } from "lucide-react";\nimport { Button } from "@/components/ui/button";\n\nexport function ButtonLoader() {\n  return <Button disabled><Loader2 className="h-4 w-4 animate-spin" />Loading</Button>;\n}` },
      ] }];
    case "tabs":
      return [{ title: "Tabs", description: "Copyable tab layouts.", items: [{ title: "Patient Profile Tabs", description: "Tabbed patient profile layout.", preview: <Tabs defaultValue="summary"><TabsList><TabsTrigger value="summary">Summary</TabsTrigger><TabsTrigger value="visits">Visits</TabsTrigger></TabsList><TabsContent value="summary">Patient summary</TabsContent><TabsContent value="visits">Visit history</TabsContent></Tabs>, code: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";\n\nexport function PatientProfileTabs() {\n  return <Tabs defaultValue="summary"><TabsList><TabsTrigger value="summary">Summary</TabsTrigger><TabsTrigger value="visits">Visits</TabsTrigger></TabsList><TabsContent value="summary">Patient summary</TabsContent><TabsContent value="visits">Visit history</TabsContent></Tabs>;\n}` }] }];
    default:
      return genericSections(item);
  }
}
