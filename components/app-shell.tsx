import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { label: string; href?: string };

export function AppShell({
  children,
  crumbs,
  width = "2xl",
}: {
  children: ReactNode;
  crumbs?: Crumb[];
  width?: "xl" | "2xl" | "3xl" | "4xl";
}) {
  const widthCls = {
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }[width];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="inline-flex items-center gap-2.5 font-heading text-[20px] font-extrabold tracking-tight text-foreground">
            <span aria-hidden className="inline-grid size-[26px] place-items-center">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <rect x="2" y="2" width="22" height="22" rx="6" fill="#1E1B1A" />
                <path
                  d="M6 17c2.5-1 3.5-5 7-5s4.5 4 7 5"
                  stroke="#FF6B35"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="6" cy="17" r="1.6" fill="#FAF8F5" />
                <circle cx="20" cy="17" r="1.6" fill="#FAF8F5" />
              </svg>
            </span>
            <span>
              MCPBuilder
              <span className="font-medium text-muted-foreground">.ai</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Build another →
          </Link>
        </div>
      </header>

      <main className={`mx-auto w-full ${widthCls} px-6 py-12 sm:py-16`}>
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {crumbs.map((c, i) => (
                <li key={i} className="inline-flex items-center gap-1.5">
                  {c.href ? (
                    <Link href={c.href} className="transition-colors hover:text-foreground">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden>/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {children}
      </main>
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: ReactNode;
}) {
  return (
    <header className="mb-10">
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span aria-hidden className="size-1.5 rounded-full bg-primary" />
          {eyebrow}
        </span>
      )}
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      {body && <p className="mt-3 max-w-xl text-pretty text-muted-foreground">{body}</p>}
    </header>
  );
}
