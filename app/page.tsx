import { UrlInput } from "@/components/url-input";

const STEPS = [
  {
    n: 1,
    title: "Paste a URL",
    body: "Drop in a GitHub repo or website. Gemini 2.5 Flash reads the entire codebase in one pass.",
  },
  {
    n: 2,
    title: "Review the tools",
    body: "We propose a clean set of MCP tools. Rename them, edit descriptions, or switch off write actions.",
  },
  {
    n: 3,
    title: "Connect any agent",
    body: "Get a live MCP URL for Claude, ChatGPT, and Cursor — deployed to the edge in seconds.",
  },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center px-6 py-20">
      {/* Soft background wash */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-muted/60 via-background to-background" />

      <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center">
        <span className="mb-7 inline-flex items-center rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          YC S26 · Software for Agents
        </span>

        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Make any website AI-ready in 60 seconds
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
          Paste your GitHub repo or website URL. We&apos;ll generate a working
          MCP server you can connect to Claude, ChatGPT, and Cursor.
        </p>

        <div className="mt-10 flex justify-center">
          <UrlInput />
        </div>
      </div>

      <section className="mt-24 w-full max-w-4xl">
        <h2 className="text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
          How it works
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-xl border bg-card p-5 text-left">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {s.n}
              </span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 text-center text-xs text-muted-foreground">
        Built at a hackathon · YC S26 &ldquo;Software for Agents&rdquo; RFS
        validated
      </footer>
    </main>
  );
}
