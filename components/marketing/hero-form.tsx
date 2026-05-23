"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IArrow, ICheck } from "./icons";

type Busy = "scan" | "demo" | null;

// Replace this with your real API client. The interface is:
//   apiClient.post<T>(path, body?) → Promise<T>
const apiClient = {
  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(
      (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000") + path,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
  },
};

export function HeroForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<Busy>(null);

  async function startScan(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Paste a GitHub repo or website URL first.");
      return;
    }
    const sourceUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    setBusy("scan");
    try {
      const { projectId } = await apiClient.post<{ projectId: string }>(
        "/api/scan",
        { sourceUrl },
      );
      router.push(`/scan/${projectId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      setBusy(null);
    }
  }

  async function startDemo() {
    setBusy("demo");
    try {
      const { projectId } = await apiClient.post<{ projectId: string }>(
        "/api/scan/akaunting-demo",
      );
      router.push(`/scan/${projectId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      setBusy(null);
    }
  }

  return (
    <form className="hero-actions" onSubmit={startScan}>
      <label className="hero-input" htmlFor="hero-url">
        <span className="url-prefix">https://</span>
        <input
          id="hero-url"
          type="text"
          placeholder="yourshop.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={busy !== null}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary" disabled={busy !== null}>
          {busy === "scan" ? "Starting…" : "Make it AI-ready"}
          {busy === "scan" ? null : <IArrow size={18} />}
        </button>
      </label>
      <p className="trust">
        <span>
          <ICheck size={14} className="check" /> Free to try
        </span>
        <span className="sep"></span>
        <span>No credit card</span>
        <span className="sep"></span>
        <span>Ready in under a minute</span>
      </p>
      <button type="button" onClick={startDemo} disabled={busy !== null} className="demo-link">
        {busy === "demo"
          ? "Loading demo…"
          : "or try with a demo — Akaunting accounting →"}
      </button>
    </form>
  );
}
