"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import type {
  AuthType,
  AuthCredentials,
  BackendConfig,
} from "@/lib/types";

const AUTH_OPTIONS: { value: AuthType; label: string; helper: string }[] = [
  {
    value: "bearer",
    label: "Bearer Token",
    helper: "Authorization: Bearer <token> — most modern REST APIs.",
  },
  {
    value: "basic",
    label: "Basic Auth",
    helper: "Username + password — listmonk, older WordPress, many self-hosted apps.",
  },
  {
    value: "api_key_header",
    label: "API Key (Header)",
    helper: "Custom header like X-API-Key — Stripe, Shopify, SendGrid.",
  },
  {
    value: "api_key_query",
    label: "API Key (Query Param)",
    helper: "?api_key=... — legacy APIs.",
  },
  {
    value: "none",
    label: "No auth",
    helper: "Public endpoints. Not recommended for tools that write data.",
  },
];

type TestResult =
  | { ok: true; status?: number }
  | { ok: false; status?: number; error: string };

export function ConnectForm({
  projectId,
  initial,
}: {
  projectId: string;
  initial: BackendConfig | null;
}) {
  const [apiBase, setApiBase] = useState(initial?.api_base ?? "");
  const [authType, setAuthType] = useState<AuthType>(
    initial?.auth_type ?? "bearer",
  );
  const [creds, setCreds] = useState<AuthCredentials>(
    initial?.auth_credentials ?? {},
  );
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  function updateCred(field: keyof AuthCredentials, value: string) {
    setCreds((p) => ({ ...p, [field]: value }));
    // Editing creds invalidates the previous test result.
    setResult(null);
  }

  function changeAuthType(next: AuthType) {
    setAuthType(next);
    setResult(null);
  }

  async function test() {
    const trimmed = apiBase.trim();
    if (!trimmed) {
      toast.error("API base URL is required.");
      return;
    }
    setTesting(true);
    setResult(null);
    try {
      const data = await apiClient.post<TestResult>("/api/test-connection", {
        projectId,
        apiBase: trimmed,
        authType,
        credentials: creds,
      });
      setResult(data);
      if (data.ok) {
        toast.success(
          data.status
            ? `Connected (HTTP ${data.status}). Credentials saved.`
            : "Connected. Credentials saved.",
        );
      } else {
        toast.error("Connection failed — see details below.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setResult({ ok: false, error: message });
      toast.error(message);
    } finally {
      setTesting(false);
    }
  }

  const helperText =
    AUTH_OPTIONS.find((o) => o.value === authType)?.helper ?? "";

  return (
    <div className="space-y-7">
      {/* API base URL */}
      <div className="space-y-2">
        <Label htmlFor="api-base">API Base URL</Label>
        <Input
          id="api-base"
          type="url"
          placeholder="https://yoursite.com"
          value={apiBase}
          onChange={(e) => {
            setApiBase(e.target.value);
            setResult(null);
          }}
          className="h-11 text-base"
          autoComplete="off"
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground">
          The root URL of your application. Endpoint paths from the next step
          will be appended to this.
        </p>
      </div>

      {/* Auth type */}
      <div className="space-y-2">
        <Label htmlFor="auth-type">Authentication</Label>
        <select
          id="auth-type"
          value={authType}
          onChange={(e) => changeAuthType(e.target.value as AuthType)}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {AUTH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">{helperText}</p>
      </div>

      {/* Conditional credential fields */}
      <CredFields authType={authType} creds={creds} onChange={updateCred} />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button onClick={test} disabled={testing} className="gap-2">
          {testing ? (
            <>
              <Spinner /> Testing…
            </>
          ) : (
            "Test Connection"
          )}
        </Button>
        {result?.ok && (
          <Link
            href={`/map/${projectId}`}
            className={buttonVariants({ variant: "default" })}
          >
            Continue → Map endpoints
          </Link>
        )}
      </div>

      {/* Result banner */}
      {result &&
        (result.ok ? (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            ✓ Connected
            {result.status ? ` — HTTP ${result.status}` : ""}. Backend config
            saved.
          </div>
        ) : (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            ✗ {result.error}
          </div>
        ))}
    </div>
  );
}

function Spinner() {
  return (
    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

function CredFields({
  authType,
  creds,
  onChange,
}: {
  authType: AuthType;
  creds: AuthCredentials;
  onChange: (field: keyof AuthCredentials, value: string) => void;
}) {
  if (authType === "none") {
    return (
      <p className="text-sm text-muted-foreground">
        No credentials needed for public endpoints.
      </p>
    );
  }
  if (authType === "basic") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <CredField
          label="Username"
          value={creds.username ?? ""}
          onChange={(v) => onChange("username", v)}
        />
        <CredField
          label="Password"
          type="password"
          value={creds.password ?? ""}
          onChange={(v) => onChange("password", v)}
        />
      </div>
    );
  }
  if (authType === "bearer") {
    return (
      <CredField
        label="Bearer Token"
        type="password"
        placeholder="eyJhbGc…"
        value={creds.token ?? ""}
        onChange={(v) => onChange("token", v)}
      />
    );
  }
  if (authType === "api_key_header") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <CredField
          label="Header Name"
          placeholder="X-API-Key"
          value={creds.key_name ?? ""}
          onChange={(v) => onChange("key_name", v)}
        />
        <CredField
          label="Key Value"
          type="password"
          value={creds.key_value ?? ""}
          onChange={(v) => onChange("key_value", v)}
        />
      </div>
    );
  }
  // api_key_query
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <CredField
        label="Query Param Name"
        placeholder="api_key"
        value={creds.key_name ?? ""}
        onChange={(v) => onChange("key_name", v)}
      />
      <CredField
        label="Key Value"
        type="password"
        value={creds.key_value ?? ""}
        onChange={(v) => onChange("key_value", v)}
      />
    </div>
  );
}

function CredField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const id = `cred-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        className="h-10"
      />
    </div>
  );
}
