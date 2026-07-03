"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Cross, Eye, EyeOff, KeyRound, LockKeyhole, Mail, Moon, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { useUiPreference } from "@/components/providers/ui-preference-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { themePresets } from "@/config/theme";
import { cn } from "@/lib/utils";

function AuthFrame({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const { preference, setPreference } = useUiPreference();

  return (
    <main className="min-h-dvh bg-background px-4 py-4 text-foreground">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col justify-between gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Cross className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Plasmit Hospital</div>
              <div className="text-xs text-muted-foreground">Staff access console</div>
            </div>
          </div>
          <Button
            size="icon"
            variant="outline"
            aria-label="Toggle theme mode"
            onClick={() => setPreference({ ...preference, mode: preference.mode === "dark" ? "light" : "dark" })}
          >
            <Moon className="h-4 w-4" />
          </Button>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {children}
            <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
              {themePresets.slice(0, 5).map((preset) => (
                <button
                  key={preset.id}
                  className={cn(
                    "h-6 w-6 rounded-full border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    preference.colorPreset === preset.id && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                  )}
                  style={{ backgroundColor: `hsl(${preset.hsl})` }}
                  onClick={() => setPreference({ ...preference, colorPreset: preset.id })}
                  aria-label={`Use ${preset.label} theme`}
                  type="button"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 text-center text-xs text-muted-foreground">
          {footer}
          <div>Support: securitydesk@plasmit.care • +91 20 4000 2211</div>
        </div>
      </div>
    </main>
  );
}

export function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const router = useRouter();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (!event.currentTarget.username.value) {
        setError("Enter username, email, or mobile to continue.");
        return;
      }
      toast.success("Static login accepted. Continue with MFA preview.");
      router.push("/verify-otp");
    }, 400);
  }

  return (
    <AuthFrame title="Staff Sign In" description="Secure access for hospital operations, clinical, and admin teams." footer={<Link className="font-medium text-primary" href="/forgot-password">Forgot password?</Link>}>
      {error ? <AlertBanner icon={LockKeyhole} tone="danger" title="Sign in blocked">{error}</AlertBanner> : null}
      <form className="space-y-3" onSubmit={submit}>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Username, email, or mobile</span>
          <Input name="username" autoComplete="username" placeholder="EMP-1001 or staff@plasmit.care" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Password</span>
          <div className="relative">
            <Input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter password" className="pr-10" />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input className="h-4 w-4 rounded border-input accent-primary" type="checkbox" />
          Remember this device after MFA
        </label>
        <Button className="w-full" disabled={loading}>
          <ShieldCheck className="h-4 w-4" />
          {loading ? "Checking..." : "Sign in"}
        </Button>
      </form>
    </AuthFrame>
  );
}

export function ForgotPasswordPage() {
  return (
    <AuthFrame title="Recover Password" description="Send a recovery code to the registered staff email or mobile." footer={<Link className="font-medium text-primary" href="/login">Back to login</Link>}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          toast.success("Reset code sent in static preview");
        }}
      >
        <label className="space-y-1 text-sm">
          <span className="font-medium">Email, username, or mobile</span>
          <Input autoComplete="username" placeholder="ananya.sharma@plasmit.care" />
        </label>
        <Button className="w-full">
          <Mail className="h-4 w-4" />
          Send reset code
        </Button>
      </form>
    </AuthFrame>
  );
}

export function ResetPasswordPage() {
  return (
    <AuthFrame title="Reset Password" description="Use the verification code and set a compliant password." footer={<Link className="font-medium text-primary" href="/login">Back to login</Link>}>
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); toast.success("Password reset validated in static preview"); }}>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Verification code</span>
          <Input inputMode="numeric" placeholder="••••••" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">New password</span>
          <Input type="password" placeholder="Minimum 12 characters" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Confirm password</span>
          <Input type="password" placeholder="Re-enter new password" />
        </label>
        <div className="rounded-md bg-surface-muted p-2 text-xs text-muted-foreground">Strength policy: 12+ chars, uppercase, lowercase, number, and special character.</div>
        <Button className="w-full">
          <KeyRound className="h-4 w-4" />
          Reset password
        </Button>
      </form>
    </AuthFrame>
  );
}

export function VerifyOtpPage() {
  const router = useRouter();
  return (
    <AuthFrame title="MFA Verification" description="Confirm the second factor before opening the HMS workspace." footer={<Link className="font-medium text-primary" href="/login">Use another account</Link>}>
      <AlertBanner icon={Smartphone} title="Code sent">Delivery method: SMS and email fallback. Authenticator app support is prepared for backend integration.</AlertBanner>
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); toast.success("MFA verified in static preview"); router.push("/dashboard"); }}>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Verification code</span>
          <Input inputMode="numeric" maxLength={6} placeholder="Enter 6 digit code" />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input className="h-4 w-4 rounded border-input accent-primary" type="checkbox" />
          Trust this device for 14 days
        </label>
        <Button className="w-full">
          <CheckCircle2 className="h-4 w-4" />
          Verify and continue
        </Button>
        <Button className="w-full" variant="outline" type="button" onClick={() => toast.info("Resend available after cooldown")}>
          Resend code
        </Button>
      </form>
    </AuthFrame>
  );
}
