"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BedDouble,
  CalendarClock,
  ClipboardCheck,
  CreditCard,
  FlaskConical,
  IdCard,
  Pill,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useRole } from "@/components/providers/role-provider";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dashboardQuickActions } from "@/data/navigation";
import { appointmentTimeline, bedOccupancy, dashboardStats, departmentActivity, recentActivity } from "@/data/mock";

const statIcons = [Stethoscope, IdCard, CalendarClock, Users, BedDouble, BedDouble, FlaskConical, Pill, CreditCard, AlertTriangle];

export function DashboardPage() {
  const { role } = useRole();
  const roleMessage =
    role === "Doctor"
      ? "Clinical queue, patient safety, and pending reviews are emphasized for your role."
      : role === "Management"
        ? "Financial, occupancy, and operational risk signals are emphasized for management."
      : "Hospital-wide operational control view with static Phase 1 data.";
  const quickActions =
    role === "Doctor"
      ? dashboardQuickActions.filter((action) => ["consult", "sample", "monitor"].includes(action.id))
      : role === "Nurse"
        ? dashboardQuickActions.filter((action) => ["admit", "monitor", "sample"].includes(action.id))
        : role === "Billing Executive"
          ? dashboardQuickActions.filter((action) => ["bill", "register"].includes(action.id))
          : role === "Management"
            ? dashboardQuickActions.filter((action) => ["bill", "monitor", "inventory"].includes(action.id))
            : dashboardQuickActions;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hospital Command Dashboard"
        description={roleMessage}
        eyebrow="Phase 1 foundation / Static data"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/notifications">Review alerts</Link>
            </Button>
            <Button>
              <Plus className="h-4 w-4" />
              Quick action
            </Button>
          </>
        }
      />

      <section className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardStats.map((stat, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 8 }}
            key={stat.id}
            transition={{ delay: index * 0.025 }}
          >
            <StatCard
              label={stat.label}
              value={stat.value}
              change={stat.change}
              context={stat.context}
              tone={stat.tone}
              icon={statIcons[index] ?? Activity}
              currency={stat.id === "revenue"}
            />
          </motion.div>
        ))}
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Role-Aware Quick Actions</CardTitle>
            <CardDescription>Actions update with the selected static role and route into future phase workspaces.</CardDescription>
          </div>
          <StatusPill tone="success">{role}</StatusPill>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button asChild className="h-auto justify-start p-4" key={action.id} variant="outline">
                  <Link href={action.route}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-left">
                      <span className="block text-sm font-semibold text-slate-900">{action.label}</span>
                      <span className="block text-xs font-normal text-slate-500">Open {action.route}</span>
                    </span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Department Activity</CardTitle>
              <CardDescription>Queue pressure, appointments, and doctor availability.</CardDescription>
            </div>
            <StatusPill tone="info">Live-looking static</StatusPill>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="sticky top-0 z-10 grid grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Department</span>
                  <span>Queue</span>
                  <span>Doctors</span>
                  <span>Status</span>
                </div>
                {departmentActivity.map((item) => (
                  <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr] items-center border-b border-slate-100 px-4 py-3 text-sm even:bg-slate-50/45 last:border-0 hover:bg-sky-50/70" key={item.department}>
                    <span className="font-medium text-slate-900">{item.department}</span>
                    <span className="text-slate-600">{item.queue}</span>
                    <span className="text-slate-600">{item.doctors}</span>
                    <StatusPill tone={item.tone}>{item.status}</StatusPill>
                  </div>
                ))}
              </div>
              <div className="min-h-[260px] rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 text-sm font-semibold text-slate-950">Appointment Timeline</div>
                <ResponsiveContainer height={220} width="100%">
                  <BarChart data={appointmentTimeline} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--surface-muted))" }}
                      contentStyle={{
                        background: "hsl(var(--surface))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Work</CardTitle>
            <CardDescription>Alerts, approvals, and recent movement.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="alerts">
              <TabsList>
                <TabsTrigger value="alerts">Activity</TabsTrigger>
                <TabsTrigger value="beds">Beds</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>
              <TabsContent value="alerts" className="space-y-2">
                {recentActivity.map((item) => (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50" key={item.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.meta}</div>
                      </div>
                      <StatusPill tone={item.tone}>{item.tone}</StatusPill>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="beds" className="space-y-3">
                {bedOccupancy.map((item) => {
                  const pct = Math.round((item.occupied / item.total) * 100);
                  return (
                    <div key={item.ward}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium text-slate-900">{item.ward}</span>
                        <span className="text-slate-500">{item.occupied}/{item.total}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-primary shadow-[0_0_0_1px_rgba(37,99,235,0.12)]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </TabsContent>
              <TabsContent value="tasks" className="space-y-2">
                {["Approve emergency discount", "Acknowledge critical lab alert", "Review ICU discharge readiness"].map((task) => (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-sky-200 hover:bg-sky-50/50" key={task}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                      <ClipboardCheck className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-slate-700">{task}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
