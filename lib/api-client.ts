// Thin wrapper around `fetch` that prepends NEXT_PUBLIC_BACKEND_URL.
// The FastAPI backend (automcp/backend/) serves every endpoint the frontend
// used to host itself, with the same /api/* paths.

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

type FetchOptions = {
  /** Bypass the Next.js cache (used by polling endpoints). */
  noStore?: boolean;
  /** AbortSignal forwarded to fetch. */
  signal?: AbortSignal;
};

async function unwrap<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && data !== null
        ? // FastAPI HTTPException body is { detail: string }; Next.js used { error: string }.
          (data as { detail?: unknown; error?: unknown }).detail ??
          (data as { error?: unknown }).error
        : null) ?? `HTTP ${res.status}`;
    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message),
    );
  }
  return data as T;
}

export const apiClient = {
  url(path: string): string {
    return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
  },

  async get<T = unknown>(path: string, opts: FetchOptions = {}): Promise<T> {
    const res = await fetch(this.url(path), {
      method: "GET",
      cache: opts.noStore ? "no-store" : "default",
      signal: opts.signal,
    });
    return unwrap<T>(res);
  },

  /** Like get(), but returns null on 404 instead of throwing — handy for
   *  server-component pages that want to call notFound(). */
  async getOrNull<T = unknown>(
    path: string,
    opts: FetchOptions = {},
  ): Promise<T | null> {
    const res = await fetch(this.url(path), {
      method: "GET",
      cache: opts.noStore ? "no-store" : "default",
      signal: opts.signal,
    });
    if (res.status === 404) return null;
    return unwrap<T>(res);
  },

  async post<T = unknown>(
    path: string,
    body?: unknown,
    opts: FetchOptions = {},
  ): Promise<T> {
    const res = await fetch(this.url(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      cache: opts.noStore ? "no-store" : "default",
      signal: opts.signal,
    });
    return unwrap<T>(res);
  },
};

export { BACKEND_URL };
