# MCPBuilderAI — Replica build instructions

Feed this file to Claude Code (or any coding agent) and tell it: **"Implement everything in this file exactly. Don't paraphrase, don't simplify, don't substitute. Match the copy and code byte-for-byte."**

The output is a Next.js 15 / React 19 / Tailwind v4 project containing the MCPBuilder.ai marketing landing page (`/`) and a 5-route flow (`/scan/[id]`, `/confirm/[id]`, `/connect/[id]`, `/map/[id]`, `/success/[id]`) sharing one warm cream + coral design system.

---

## Step 0 — Scaffold

Run these commands in a clean directory:

```bash
npx create-next-app@15.5.18 mcpbuilder-ai \
  --typescript --tailwind --app --no-src-dir \
  --no-eslint --no-turbopack --import-alias "@/*"

cd mcpbuilder-ai

# Install runtime deps
npm install \
  @base-ui/react@^1.5.0 \
  class-variance-authority@^0.7.1 \
  clsx@^2.1.1 \
  lucide-react@^1.16.0 \
  next-themes@^0.4.6 \
  shadcn@^4.8.0 \
  sonner@^2.0.7 \
  tailwind-merge@^3.6.0 \
  tw-animate-css@^1.4.0

# Initialize shadcn (new-york, neutral) and add the primitives we'll re-skin
npx shadcn@latest init -d -y
npx shadcn@latest add -y button input card badge dialog progress label textarea switch separator sonner
```

When shadcn finishes, you'll have `components/ui/*` and a default `lib/utils.ts` with the `cn()` helper. Don't change them — only the color tokens get rewritten in Step 2.

---

## Step 1 — `package.json`

Overwrite `package.json` with this (preserves npm's lockfile work):

```json
{
  "name": "mcpbuilder-ai",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@base-ui/react": "^1.5.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.16.0",
    "next": "15.5.18",
    "next-themes": "^0.4.6",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "shadcn": "^4.8.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.6.0",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.18",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## Step 2 — Color tokens & global styles

Overwrite `app/globals.css` with this exact content. The shadcn primitives will inherit the warm/coral palette automatically.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter), var(--font-sans-fallback), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), var(--font-geist-mono), ui-monospace, monospace;
  --font-heading: var(--font-inter-tight), var(--font-inter), system-ui, sans-serif;
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --ink: #1E1B1A;
  --ink-soft: #5A5450;
  --muted-tone: #8A837C;
  --cream: #FAF8F5;
  --soft: #FFF4EC;
  --coral: #FF6B35;
  --coral-hover: #F25B25;
  --sage: #2D8659;
  --sage-soft: #E6F0EA;
  --hairline: #E8E3DA;
  --hairline-strong: #D8D2C7;

  --background: #FAF8F5;
  --foreground: #1E1B1A;
  --card: #FFFFFF;
  --card-foreground: #1E1B1A;
  --popover: #FFFFFF;
  --popover-foreground: #1E1B1A;
  --primary: #FF6B35;
  --primary-foreground: #FFFFFF;
  --secondary: #FFF4EC;
  --secondary-foreground: #1E1B1A;
  --muted: #FFF4EC;
  --muted-foreground: #5A5450;
  --accent: #FFF4EC;
  --accent-foreground: #1E1B1A;
  --destructive: #C8412B;
  --border: #E8E3DA;
  --input: #D8D2C7;
  --ring: #FF6B35;

  --radius: 0.75rem;

  --chart-1: #FF6B35;
  --chart-2: #F5A623;
  --chart-3: #2D8659;
  --chart-4: #5A5450;
  --chart-5: #8A837C;

  --sidebar: #FAF8F5;
  --sidebar-foreground: #1E1B1A;
  --sidebar-primary: #FF6B35;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #FFF4EC;
  --sidebar-accent-foreground: #1E1B1A;
  --sidebar-border: #E8E3DA;
  --sidebar-ring: #FF6B35;
}

.dark {
  --background: #1E1B1A;
  --foreground: #FAF8F5;
  --card: #2C2826;
  --card-foreground: #FAF8F5;
  --popover: #2C2826;
  --popover-foreground: #FAF8F5;
  --primary: #FF6B35;
  --primary-foreground: #FFFFFF;
  --secondary: #2C2826;
  --secondary-foreground: #FAF8F5;
  --muted: #2C2826;
  --muted-foreground: #B8B0A8;
  --accent: #2C2826;
  --accent-foreground: #FAF8F5;
  --destructive: #EE5A41;
  --border: rgba(250, 248, 245, 0.1);
  --input: rgba(250, 248, 245, 0.18);
  --ring: #FF6B35;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
  h1, h2, h3, h4 {
    font-family: var(--font-heading);
    letter-spacing: -0.02em;
  }
}
```

---

## Step 3 — Marketing CSS (scoped to `.marketing`)

Create `app/marketing.css` with this exact content (~600 lines). Every selector is scoped under `.marketing` so it doesn't leak into the inner app routes.

```css
/* MCPBuilder.ai landing page — design tokens + scoped styles.
   All selectors live under .marketing so they don't bleed into the rest of
   the app (scan / confirm / connect / map / success use shadcn). */

.marketing {
  color-scheme: light;
  --ink: #1E1B1A;
  --ink-2: #2C2826;
  --ink-soft: #5A5450;
  --muted-fg: #8A837C;
  --cream: #FAF8F5;
  --soft: #FFF4EC;
  --action: #FF6B35;
  --action-hover: #F25B25;
  --glow: #F5A623;
  --sage: #2D8659;
  --sage-soft: #E6F0EA;
  --hairline: #E8E3DA;
  --hairline-strong: #D8D2C7;
  --white: #ffffff;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --shadow-xs: 0 1px 2px rgba(30,27,26,0.04);
  --shadow-sm: 0 1px 3px rgba(30,27,26,0.06), 0 1px 2px rgba(30,27,26,0.03);
  --shadow-md: 0 4px 14px rgba(30,27,26,0.06), 0 1px 3px rgba(30,27,26,0.04);
  --shadow-lg: 0 14px 40px rgba(30,27,26,0.08), 0 2px 8px rgba(30,27,26,0.04);

  --font-display: var(--font-inter-tight), "Inter", system-ui, -apple-system, sans-serif;
  --font-body: var(--font-inter), system-ui, -apple-system, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace;

  --pad-section: 140px;
  --pad-section-sm: 80px;
  --container: 1200px;
  --container-wide: 1320px;

  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.65;
  color: var(--ink);
  background: var(--cream);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  min-height: 100vh;
}

.marketing * { box-sizing: border-box; }
.marketing img, .marketing svg { display: block; max-width: 100%; }

.marketing h1,
.marketing h2,
.marketing h3,
.marketing h4 {
  font-family: var(--font-display);
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.08;
  color: var(--ink);
  font-weight: 700;
  text-wrap: balance;
}
.marketing h1 { font-size: clamp(40px, 5.4vw, 68px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.02; }
.marketing h2 { font-size: clamp(30px, 3.4vw, 44px); font-weight: 700; letter-spacing: -0.025em; line-height: 1.05; }
.marketing h3 { font-size: clamp(20px, 1.6vw, 24px); font-weight: 600; letter-spacing: -0.015em; line-height: 1.2; }
.marketing h4 { font-size: 18px; font-weight: 600; }
.marketing p { margin: 0; text-wrap: pretty; }

.marketing .eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.marketing .eyebrow .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--action); display: inline-block; }

.marketing .lede { font-size: clamp(17px, 1.3vw, 19px); color: var(--ink-soft); line-height: 1.6; }

.marketing .container { width: min(100%, var(--container)); margin: 0 auto; padding: 0 32px; }
.marketing .container-wide { width: min(100%, var(--container-wide)); margin: 0 auto; padding: 0 32px; }
.marketing section { padding: var(--pad-section) 0; }
.marketing .section-soft { background: var(--soft); }
.marketing .section-cream { background: var(--cream); }
.marketing .section-white { background: var(--white); }
.marketing .section-ink { background: var(--ink); color: var(--cream); }

.marketing .section-head { max-width: 720px; margin: 0 auto 64px; text-align: center; }
.marketing .section-head.left { text-align: left; margin: 0 0 56px; }
.marketing .section-head .lede { margin-top: 18px; }

.marketing .btn {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  padding: 15px 26px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  transition: transform .15s ease-out, box-shadow .15s ease-out, background .15s, color .15s;
  white-space: nowrap;
  letter-spacing: -0.005em;
}
.marketing .btn-primary {
  background: var(--action);
  color: var(--white);
  box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 6px 18px rgba(255,107,53,0.28);
}
.marketing .btn-primary:hover { transform: translateY(-1px); background: var(--action-hover); box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 10px 24px rgba(255,107,53,0.34); }
.marketing .btn-primary:active { transform: translateY(0); }
.marketing .btn-primary:disabled { opacity: .7; cursor: not-allowed; transform: none; }
.marketing .btn-ghost {
  background: transparent;
  color: var(--ink);
  border: 1.5px solid var(--hairline-strong);
}
.marketing .btn-ghost:hover { background: var(--white); border-color: var(--ink); transform: translateY(-1px); }
.marketing .btn-link {
  background: transparent;
  color: var(--ink);
  padding: 14px 0;
  font-weight: 600;
}
.marketing .btn-link .arrow { transition: transform .2s; display: inline-flex; }
.marketing .btn-link:hover .arrow { transform: translateX(3px); }

.marketing .card {
  background: var(--white);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-xs);
  transition: transform .2s ease-out, box-shadow .2s, border-color .2s;
}
.marketing .card:hover { box-shadow: var(--shadow-md); }

.marketing .hero-input {
  display: flex;
  background: var(--white);
  border: 1.5px solid var(--hairline-strong);
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, var(--shadow-md);
  transition: border-color .15s, box-shadow .15s;
  align-items: stretch;
  max-width: 540px;
}
.marketing .hero-input:focus-within { border-color: var(--action); box-shadow: 0 0 0 4px rgba(255,107,53,0.12), var(--shadow-md); }
.marketing .hero-input .url-prefix {
  display: flex; align-items: center; padding-left: 16px;
  color: var(--muted-fg); font-family: var(--font-mono); font-size: 14px;
}
.marketing .hero-input input {
  flex: 1; border: none; outline: none; background: transparent;
  font: inherit; font-size: 18px; padding: 14px 8px; color: var(--ink);
  min-width: 0;
}
.marketing .hero-input input::placeholder { color: var(--muted-fg); }
.marketing .hero-input .btn { padding: 14px 22px; border-radius: 9px; }

.marketing .trust {
  display: inline-flex; gap: 18px; align-items: center;
  color: var(--ink-soft); font-size: 14px;
  margin-top: 22px;
  flex-wrap: wrap;
}
.marketing .trust .sep { width: 4px; height: 4px; border-radius: 50%; background: var(--hairline-strong); }
.marketing .trust .check { color: var(--sage); }

.marketing .demo-link {
  margin-top: 14px;
  font-size: 14px;
  color: var(--ink-soft);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  font-family: inherit;
}
.marketing .demo-link:hover { color: var(--action); }
.marketing .demo-link:disabled { opacity: .6; cursor: not-allowed; }

.marketing .site-header {
  position: sticky; top: 0; z-index: 50;
  backdrop-filter: saturate(140%) blur(14px);
  background: rgba(250,248,245,0.78);
  border-bottom: 1px solid transparent;
  transition: border-color .2s, background .2s;
}
.marketing .site-header.scrolled { border-color: var(--hairline); }
.marketing .nav { display: flex; align-items: center; justify-content: space-between; height: 72px; }
.marketing .logo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.025em;
  color: var(--ink);
  display: inline-flex; align-items: center; gap: 10px;
  text-decoration: none;
}
.marketing .logo .ai { font-weight: 500; color: var(--ink-soft); letter-spacing: -0.01em; }
.marketing .logo .bridge-mark { width: 26px; height: 26px; display: inline-grid; place-items: center; }
.marketing .nav-links { display: flex; align-items: center; gap: 32px; }
.marketing .nav-links a {
  font-size: 15px; color: var(--ink-2); text-decoration: none; font-weight: 500;
  transition: color .15s;
}
.marketing .nav-links a:hover { color: var(--action); }
.marketing .nav-cta { display: flex; gap: 10px; align-items: center; }
.marketing .nav-cta .btn { padding: 10px 18px; font-size: 14px; }

.marketing .hero {
  padding-top: 100px;
  padding-bottom: 140px;
  position: relative;
  overflow: hidden;
}
.marketing .hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 80px;
  align-items: center;
}
.marketing .hero h1 .accent {
  background: linear-gradient(180deg, rgba(255,107,53,0) 65%, rgba(255,107,53,0.18) 65%);
  padding: 0 2px;
}
.marketing .hero .lede { margin-top: 24px; max-width: 540px; font-size: 20px; }
.marketing .hero-actions { margin-top: 36px; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }

.marketing .bridge-stage {
  position: relative;
  padding: 28px;
  border-radius: 28px;
  background:
    radial-gradient(60% 60% at 50% 35%, rgba(255,107,53,0.07), rgba(255,107,53,0) 70%),
    var(--white);
  border: 1px solid var(--hairline);
  box-shadow: var(--shadow-lg);
  aspect-ratio: 1 / 1.05;
  display: flex; flex-direction: column; justify-content: space-between;
}
.marketing .bridge-row { display: flex; gap: 12px; align-items: stretch; }
.marketing .bridge-row.three { justify-content: space-between; }
.marketing .bridge-card {
  background: var(--cream);
  border: 1px solid var(--hairline);
  border-radius: 14px;
  padding: 14px 14px;
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 8px;
  box-shadow: var(--shadow-xs);
}
.marketing .bridge-card .label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted-fg); }
.marketing .bridge-card .name { font-weight: 600; font-size: 15px; }
.marketing .bridge-card .meta { font-size: 13px; color: var(--ink-soft); }
.marketing .bridge-card .avatar {
  width: 36px; height: 36px; border-radius: 10px;
  display: grid; place-items: center;
  font-weight: 700; color: var(--white);
  font-family: var(--font-display);
}
.marketing .bridge-card.ai .avatar { background: var(--ink); }
.marketing .bridge-card.bridge-center {
  background: linear-gradient(180deg, #FF6B35, #F25B25);
  color: var(--white);
  border-color: transparent;
  padding: 22px 18px;
  box-shadow: 0 18px 32px rgba(255,107,53,0.32);
}
.marketing .bridge-card.bridge-center .label { color: rgba(255,255,255,0.8); }
.marketing .bridge-card.bridge-center .name { color: var(--white); font-size: 17px; }
.marketing .bridge-card.bridge-center .meta { color: rgba(255,255,255,0.9); }
.marketing .bridge-card.business { background: var(--white); }
.marketing .bridge-card.business .avatar { background: var(--sage); }

.marketing .bridge-flow {
  display: flex; align-items: center; justify-content: center;
  padding: 14px 0;
  gap: 10px;
  color: var(--muted-fg);
  font-size: 12px;
  font-family: var(--font-mono);
  position: relative;
}
.marketing .bridge-flow .line {
  flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--hairline-strong), transparent);
  position: relative;
}
.marketing .bridge-flow .pulse {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 8px; height: 8px; border-radius: 50%; background: var(--action);
  box-shadow: 0 0 0 4px rgba(255,107,53,0.18);
  animation: pulseTravel 3.2s linear infinite;
}
@keyframes pulseTravel {
  0% { left: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}
.marketing .bridge-flow .pulse.r { animation-delay: 1.6s; animation-direction: reverse; }
.marketing .bridge-stage .stage-caption {
  position: absolute; top: 22px; right: 24px;
  font-family: var(--font-mono); font-size: 11px; color: var(--muted-fg);
  letter-spacing: 0.06em;
}

@media (prefers-reduced-motion: reduce) {
  .marketing .bridge-flow .pulse { animation: none; opacity: .8; left: 50%; }
  .marketing *, .marketing *::before, .marketing *::after {
    animation-duration: 0.001s !important;
    transition-duration: 0.001s !important;
  }
}

.marketing .problem-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  margin-bottom: 72px;
}
.marketing .bubble {
  background: var(--white);
  border: 1px solid var(--hairline);
  border-radius: 18px 18px 18px 6px;
  padding: 22px 24px;
  box-shadow: var(--shadow-xs);
  position: relative;
}
.marketing .bubble .source { font-size: 12px; color: var(--muted-fg); margin-bottom: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }
.marketing .bubble .text { font-size: 17px; line-height: 1.5; color: var(--ink); }
.marketing .bubble .text q { quotes: "\201C" "\201D"; }
.marketing .problem-summary {
  max-width: 680px; margin: 0 auto; text-align: center;
  font-size: 19px; color: var(--ink-soft); line-height: 1.6;
}
.marketing .problem-summary strong { color: var(--ink); font-weight: 600; }

.marketing .bridge-section .grid {
  display: grid; grid-template-columns: 1.2fr 1fr; gap: 80px; align-items: center;
}
.marketing .usb-diagram {
  background: var(--white);
  border: 1px solid var(--hairline);
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: var(--shadow-md);
  position: relative;
}
.marketing .usb-row { display: flex; justify-content: space-between; gap: 12px; }
.marketing .usb-chip {
  background: var(--cream); border: 1px solid var(--hairline);
  padding: 10px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600; color: var(--ink);
  display: flex; align-items: center; gap: 8px;
  min-width: 0; flex: 1;
}
.marketing .usb-chip .badge {
  width: 24px; height: 24px; border-radius: 6px;
  background: var(--ink); color: var(--white);
  display: grid; place-items: center; font-size: 11px; font-weight: 700;
  flex-shrink: 0;
}
.marketing .usb-chip.biz .badge { background: var(--sage); }
.marketing .usb-hub {
  margin: 28px auto;
  background: linear-gradient(180deg, var(--action), var(--action-hover));
  color: var(--white);
  border-radius: 16px;
  padding: 22px 26px;
  text-align: center;
  width: fit-content;
  box-shadow: 0 14px 30px rgba(255,107,53,0.3);
}
.marketing .usb-hub .hub-label { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.85; }
.marketing .usb-hub .hub-name { font-family: var(--font-display); font-weight: 700; font-size: 18px; margin-top: 4px; letter-spacing: -0.02em; }
.marketing .usb-lines { position: relative; height: 36px; }
.marketing .usb-lines svg { position: absolute; inset: 0; width: 100%; height: 100%; }

.marketing .steps {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
}
.marketing .step-card {
  background: var(--white);
  border: 1px solid var(--hairline);
  border-radius: 20px;
  padding: 36px 32px 32px;
  display: flex; flex-direction: column;
  min-height: 380px;
  position: relative;
  box-shadow: var(--shadow-xs);
  transition: transform .2s, box-shadow .2s;
}
.marketing .step-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.marketing .step-num {
  font-family: var(--font-display);
  font-size: 14px; font-weight: 600; color: var(--action);
  letter-spacing: 0.06em;
  margin-bottom: 24px;
}
.marketing .step-card h3 { margin-bottom: 12px; }
.marketing .step-card p { color: var(--ink-soft); font-size: 16px; }
.marketing .step-visual { margin-top: auto; padding-top: 28px; }

.marketing .mini-url {
  display: flex; align-items: center; gap: 8px;
  background: var(--cream); border: 1px solid var(--hairline);
  padding: 10px 14px; border-radius: 10px;
  font-family: var(--font-mono); font-size: 13px; color: var(--ink-soft);
}
.marketing .mini-url .dot-r { width: 10px; height: 10px; border-radius: 50%; background: var(--sage); }
.marketing .mini-url .cursor { width: 1.5px; height: 14px; background: var(--ink); margin-left: auto; animation: blink 1.1s steps(2) infinite; }
@keyframes blink { 50% { opacity: 0; } }

.marketing .review {
  background: var(--cream); border: 1px solid var(--hairline);
  border-radius: 12px; padding: 14px 16px;
  font-size: 13px;
  display: flex; flex-direction: column; gap: 10px;
}
.marketing .review .row { display: flex; align-items: center; gap: 10px; }
.marketing .review .check {
  width: 18px; height: 18px; border-radius: 5px; background: var(--sage);
  display: grid; place-items: center; color: white; flex-shrink: 0;
}
.marketing .review .check.off { background: var(--hairline-strong); }
.marketing .review .row span { font-weight: 500; }

.marketing .linkbox {
  background: var(--ink); color: var(--cream);
  border-radius: 12px; padding: 14px 16px;
  font-family: var(--font-mono); font-size: 13px;
  display: flex; align-items: center; gap: 10px;
}
.marketing .linkbox .copy {
  margin-left: auto; background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 5px;
  color: var(--cream); font-size: 11px;
  display: inline-flex; align-items: center; gap: 4px;
}
.marketing .linkbox .pre { color: var(--muted-fg); }

.marketing .chat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
}
.marketing .phone {
  background: var(--ink);
  border-radius: 32px;
  padding: 10px;
  box-shadow: var(--shadow-lg);
  max-width: 360px; margin: 0 auto;
}
.marketing .phone-screen {
  background: var(--cream);
  border-radius: 24px;
  padding: 20px 16px;
  min-height: 460px;
  display: flex; flex-direction: column;
}
.marketing .phone-head {
  display: flex; align-items: center; gap: 10px;
  padding-bottom: 14px; border-bottom: 1px solid var(--hairline);
  margin-bottom: 14px;
}
.marketing .phone-head .avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #FFA07A, #FF6B35);
  display: grid; place-items: center;
  color: white; font-weight: 700; font-size: 13px;
}
.marketing .phone-head .meta { display: flex; flex-direction: column; }
.marketing .phone-head .name { font-weight: 600; font-size: 14px; }
.marketing .phone-head .role { font-size: 11px; color: var(--muted-fg); }
.marketing .msg-stack { display: flex; flex-direction: column; gap: 8px; }
.marketing .msg {
  padding: 10px 14px; border-radius: 16px;
  font-size: 14px; line-height: 1.45; max-width: 86%;
}
.marketing .msg.in { background: var(--white); border: 1px solid var(--hairline); align-self: flex-start; border-bottom-left-radius: 6px; }
.marketing .msg.out { background: var(--action); color: var(--white); align-self: flex-end; border-bottom-right-radius: 6px; }
.marketing .msg.system {
  background: var(--sage-soft); color: var(--ink); align-self: flex-start;
  font-size: 12px; padding: 8px 12px; border-radius: 12px;
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid rgba(45,134,89,0.18);
}
.marketing .msg.system .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sage); }
.marketing .chat-tag {
  display: inline-flex; gap: 6px; align-items: center;
  font-size: 12px; color: var(--ink-soft); margin-bottom: 8px;
  font-weight: 600; letter-spacing: 0.04em;
}

.marketing .benefits {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
}
.marketing .benefit {
  background: var(--white);
  border: 1px solid var(--hairline);
  border-radius: 20px;
  padding: 36px 36px 40px;
  display: flex; flex-direction: column; gap: 12px;
  transition: transform .2s, box-shadow .2s, border-color .2s;
}
.marketing .benefit:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--hairline-strong); }
.marketing .benefit .icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--soft); color: var(--action);
  display: grid; place-items: center; margin-bottom: 8px;
}
.marketing .benefit h3 { font-size: 22px; }
.marketing .benefit p { color: var(--ink-soft); font-size: 16px; line-height: 1.55; }

.marketing .demo-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: 80px; align-items: center; }
.marketing .video-frame {
  background: var(--ink); border-radius: 20px; aspect-ratio: 16/10;
  position: relative; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: var(--shadow-lg);
}
.marketing .video-frame .skeleton {
  position: absolute; inset: 24px;
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255,107,53,0.16), rgba(255,107,53,0) 60%),
    repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 10px, rgba(255,255,255,0.06) 10px 20px);
  display: grid; place-items: center;
}
.marketing .video-frame .play {
  width: 84px; height: 84px; border-radius: 50%;
  background: var(--white); display: grid; place-items: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform .2s;
  border: none;
}
.marketing .video-frame .play:hover { transform: scale(1.05); }
.marketing .video-meta {
  position: absolute; bottom: 18px; left: 20px;
  color: rgba(250,248,245,0.7); font-size: 12px; font-family: var(--font-mono);
  letter-spacing: 0.06em;
}
.marketing .video-tag {
  position: absolute; top: 18px; left: 20px;
  color: var(--cream); font-size: 12px; font-weight: 600;
  background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 20px;
  backdrop-filter: blur(6px);
}

.marketing .industries {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.marketing .industry {
  background: var(--white); border: 1px solid var(--hairline);
  border-radius: 14px; padding: 22px;
  display: flex; flex-direction: column; gap: 8px;
  transition: transform .15s, box-shadow .15s, border-color .15s;
}
.marketing .industry:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--hairline-strong); }
.marketing .industry .ico {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--soft); color: var(--action);
  display: grid; place-items: center; margin-bottom: 6px;
}
.marketing .industry .name { font-weight: 600; font-size: 16px; }
.marketing .industry .desc { font-size: 13px; color: var(--ink-soft); line-height: 1.45; }

.marketing .faq { max-width: 760px; margin: 0 auto; }
.marketing .faq-item { border-bottom: 1px solid var(--hairline); }
.marketing .faq-item:first-child { border-top: 1px solid var(--hairline); }
.marketing .faq-q {
  width: 100%; background: transparent; border: none;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 24px 4px; cursor: pointer; text-align: left;
  font-family: var(--font-display); font-weight: 600; font-size: 19px;
  letter-spacing: -0.015em; color: var(--ink);
}
.marketing .faq-q:hover { color: var(--action); }
.marketing .faq-q .plus { color: var(--ink-soft); flex-shrink: 0; transition: transform .25s; }
.marketing .faq-item.open .faq-q .plus { transform: rotate(45deg); color: var(--action); }
.marketing .faq-a { max-height: 0; overflow: hidden; transition: max-height .3s ease-out; }
.marketing .faq-item.open .faq-a { max-height: 400px; }
.marketing .faq-a-inner { padding: 0 4px 24px; font-size: 16px; color: var(--ink-soft); line-height: 1.65; }

.marketing .cta-band {
  background: var(--ink);
  color: var(--cream);
  border-radius: 28px;
  padding: 96px 64px;
  margin: 0 32px;
  position: relative;
  overflow: hidden;
}
.marketing .cta-band::after {
  content: ""; position: absolute; inset: -40% -10% auto auto;
  width: 60%; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,107,53,0.22), rgba(255,107,53,0) 70%);
  pointer-events: none;
}
.marketing .cta-band h2 { color: var(--cream); font-size: clamp(34px, 4vw, 52px); max-width: 760px; }
.marketing .cta-band .lede { color: rgba(250,248,245,0.7); max-width: 580px; margin-top: 20px; font-size: 18px; }
.marketing .cta-band .actions { margin-top: 36px; display: flex; gap: 14px; flex-wrap: wrap; position: relative; }
.marketing .cta-band .btn-ghost { color: var(--cream); border-color: rgba(250,248,245,0.2); }
.marketing .cta-band .btn-ghost:hover { background: rgba(250,248,245,0.06); border-color: var(--cream); }

.marketing .footer {
  padding: 80px 0 56px;
  border-top: 1px solid var(--hairline);
}
.marketing .footer-grid {
  display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 56px;
}
.marketing .footer h4 { font-family: var(--font-body); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 16px; font-weight: 600; }
.marketing .footer ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.marketing .footer a { color: var(--ink-2); text-decoration: none; font-size: 15px; transition: color .15s; }
.marketing .footer a:hover { color: var(--action); }
.marketing .footer .tag {
  margin-top: 16px; color: var(--ink-soft); font-size: 14px; max-width: 280px; line-height: 1.55;
}
.marketing .footer .copy { margin-top: 56px; padding-top: 24px; border-top: 1px solid var(--hairline); color: var(--muted-fg); font-size: 13px; display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; }

@media (max-width: 980px) {
  .marketing { --pad-section: 88px; --pad-section-sm: 56px; }
  .marketing .hero { padding-top: 60px; padding-bottom: 80px; }
  .marketing .hero-grid { grid-template-columns: 1fr; gap: 56px; }
  .marketing .problem-grid { grid-template-columns: 1fr; gap: 16px; margin-bottom: 48px; }
  .marketing .bridge-section .grid { grid-template-columns: 1fr; gap: 48px; }
  .marketing .steps { grid-template-columns: 1fr; }
  .marketing .chat-grid { grid-template-columns: 1fr; gap: 36px; }
  .marketing .benefits { grid-template-columns: 1fr; }
  .marketing .demo-grid { grid-template-columns: 1fr; gap: 48px; }
  .marketing .industries { grid-template-columns: repeat(2, 1fr); }
  .marketing .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
  .marketing .cta-band { padding: 64px 28px; margin: 0 16px; border-radius: 20px; }
  .marketing .nav-links { display: none; }
  .marketing h1 { font-size: 40px; }
  .marketing .container, .marketing .container-wide { padding: 0 20px; }
}
@media (max-width: 540px) {
  .marketing .industries { grid-template-columns: repeat(2, 1fr); }
  .marketing .hero-input { flex-direction: column; gap: 8px; padding: 10px; }
  .marketing .hero-input .url-prefix { padding: 4px 8px 0; }
  .marketing .hero-input .btn { width: 100%; }
}
```

---

## Step 4 — Root layout with fonts

Overwrite `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "./marketing.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans-fallback" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-inter-tight",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MCPBuilder.ai — The bridge between AI and your business",
  description:
    "Make your website AI-ready in 60 seconds. ChatGPT, Claude, and Siri can then search your products, take orders, and book appointments — automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans",
        inter.variable,
        interTight.variable,
        jetbrainsMono.variable,
        geist.variable,
      )}
    >
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

---

## Step 5 — Marketing components

Create folder `components/marketing/` and the files below.

### `components/marketing/icons.tsx`

```tsx
// Lucide-style icons drawn inline. Outlined, 1.75 stroke, rounded caps.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const Icon = ({ size = 22, children, ...p }: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    {children}
  </svg>
);

export const IArrow = (p: IconProps) => (
  <Icon {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Icon>
);
export const ICheck = (p: IconProps) => (
  <Icon {...p}><path d="M20 6 9 17l-5-5" /></Icon>
);
export const IPlus = (p: IconProps) => (
  <Icon {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Icon>
);
export const IPlay = (p: IconProps) => (
  <Icon {...p}><path d="M6 4v16l14-8z" fill="currentColor" /></Icon>
);
export const ICopy = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Icon>
);
export const IUsers = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);
export const ITrophy = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Icon>
);
export const IClock = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>
);
export const ICompass = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m16 8-3 6-6 3 3-6 6-3z" fill="currentColor" fillOpacity=".15" />
  </Icon>
);
export const IGlobe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9z" />
  </Icon>
);
export const IStore = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 9 4.5 4h15L21 9" />
    <path d="M5 9v11h14V9" />
    <path d="M9 22V12h6v10" />
  </Icon>
);
export const IScissors = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M20 4 8.12 15.88" />
    <path d="M14.47 14.48 20 20" />
    <path d="M8.12 8.12 12 12" />
  </Icon>
);
export const ICalendar = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </Icon>
);
export const IUtensils = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 2v7c0 1.66 1.34 3 3 3v10" />
    <path d="M9 2v20" />
    <path d="M21 15V2l-3 3-3-3v13a3 3 0 1 0 6 0z" />
  </Icon>
);
export const IBook = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Icon>
);
export const IHeart = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.84 4.6a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.07a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.79 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Icon>
);
export const IDumbbell = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.4 14.4 9.6 9.6" />
    <path d="M18.66 16.05a3.74 3.74 0 1 0-5.3-5.29" />
    <path d="M21.5 21.5l-1.4-1.4" />
    <path d="M3.9 3.9 2.5 2.5" />
    <path d="M5.34 7.96a3.74 3.74 0 1 0 5.29 5.3" />
  </Icon>
);
export const ICamera = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
);
export const IWrench = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.7 6.3a4 4 0 0 0 5.7 5.7L21 21l-9-2.6a4 4 0 0 1-5.7-5.7L14.7 6.3z" />
  </Icon>
);
export const ICalc = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8" />
    <circle cx="8" cy="12" r=".5" fill="currentColor" />
    <circle cx="12" cy="12" r=".5" fill="currentColor" />
    <circle cx="16" cy="12" r=".5" fill="currentColor" />
    <circle cx="8" cy="16" r=".5" fill="currentColor" />
    <circle cx="12" cy="16" r=".5" fill="currentColor" />
    <circle cx="16" cy="16" r=".5" fill="currentColor" />
  </Icon>
);
export const IHome = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3 11 9-8 9 8v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2V11z" />
  </Icon>
);
export const ITruck = (p: IconProps) => (
  <Icon {...p}>
    <path d="M1 7h13v10H1z" />
    <path d="M14 10h5l3 3v4h-8" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="17" cy="19" r="2" />
  </Icon>
);
```

### `components/marketing/logo.tsx`

```tsx
export function Logo() {
  return (
    <a href="#top" className="logo" aria-label="MCPBuilder.ai">
      <span className="bridge-mark">
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
        MCPBuilder<span className="ai">.ai</span>
      </span>
    </a>
  );
}
```

### `components/marketing/header.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { Logo } from "./logo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav">
        <Logo />
        <nav className="nav-links" aria-label="Primary">
          <a href="#how">How it works</a>
          <a href="#examples">Examples</a>
          <a href="#industries">Industries</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-cta">
          <a className="btn btn-link" href="#login" style={{ padding: "10px 12px", fontSize: 14 }}>
            Sign in
          </a>
          <a className="btn btn-primary" href="#start">
            Get your AI link
          </a>
        </div>
      </div>
    </header>
  );
}
```

### `components/marketing/bridge-diagram.tsx`

```tsx
import { ICalendar, IStore } from "./icons";

export function BridgeDiagram() {
  return (
    <div
      className="bridge-stage"
      role="img"
      aria-label="Diagram showing customer's AI assistant talking to MCPBuilder bridge talking to your business systems."
    >
      <span className="stage-caption">live • behind the scenes</span>

      <div className="bridge-row three">
        <div className="bridge-card ai">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="avatar">C</div>
            <span className="label">ChatGPT</span>
          </div>
          <div className="name">&ldquo;Reorder my usual thread set&rdquo;</div>
          <div className="meta">via voice · iPhone</div>
        </div>
        <div className="bridge-card ai" style={{ transform: "translateY(8px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="avatar" style={{ background: "#FF6B35" }}>S</div>
            <span className="label">Siri</span>
          </div>
          <div className="name">&ldquo;Book Lila for Saturday&rdquo;</div>
          <div className="meta">handoff</div>
        </div>
      </div>

      <div className="bridge-flow">
        <span>request</span>
        <div className="line"><span className="pulse"></span></div>
      </div>

      <div className="bridge-row">
        <div className="bridge-card bridge-center">
          <span className="label">MCPBuilder</span>
          <div className="name">Your AI link</div>
          <div className="meta">Translates AI ↔ your shop</div>
        </div>
      </div>

      <div className="bridge-flow">
        <div className="line"><span className="pulse r"></span></div>
        <span>action</span>
      </div>

      <div className="bridge-row three">
        <div className="bridge-card business">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="avatar"><IStore size={18} /></div>
            <span className="label">Shopify</span>
          </div>
          <div className="name">Order placed</div>
          <div className="meta">3 × Gold thread set</div>
        </div>
        <div className="bridge-card business" style={{ transform: "translateY(8px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="avatar" style={{ background: "#2D8659" }}><ICalendar size={16} /></div>
            <span className="label">Calendar</span>
          </div>
          <div className="name">Sat 11:00 booked</div>
          <div className="meta">Confirmation sent</div>
        </div>
      </div>
    </div>
  );
}
```

### `components/marketing/hero-form.tsx`

Note: this client component posts to `/api/scan` and `/api/scan/akaunting-demo`. If you don't have a backend yet, replace the `apiClient.post(...)` calls with a `console.log("submit", sourceUrl)` stub — the visual is what matters.

```tsx
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
```

### `components/marketing/sections.tsx`

```tsx
import { BridgeDiagram } from "./bridge-diagram";
import { HeroForm } from "./hero-form";
import {
  IArrow,
  ICalc,
  ICalendar,
  ICheck,
  ICopy,
  IGlobe,
  IStore,
} from "./icons";

export function Hero() {
  return (
    <section className="hero" id="start">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="dot"></span>The bridge between AI and your business
            </span>
            <h1 style={{ marginTop: 20 }}>
              When your customers talk to AI,{" "}
              <span className="accent">AI should talk back to your business.</span>
            </h1>
            <p className="lede">
              Make your website AI-ready in 60 seconds. ChatGPT, Claude, and Siri
              can then search your products, take orders, and book appointments
              — automatically.
            </p>
            <HeroForm />
          </div>

          <BridgeDiagram />
        </div>
      </div>
    </section>
  );
}

export function Problem() {
  return (
    <section className="section-soft" id="problem">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot"></span>The shift</span>
          <h2 style={{ marginTop: 16 }}>
            Your customers already talk to AI. Most websites can&apos;t hear them.
          </h2>
        </div>

        <div className="problem-grid">
          <div className="bubble">
            <div className="source">— a customer · to ChatGPT</div>
            <p className="text">
              <q>Find me a yoga studio in Austin that has openings Saturday morning and book me in.</q>
            </p>
          </div>
          <div className="bubble">
            <div className="source">— a customer · to Siri</div>
            <p className="text">
              <q>Reorder the embroidery thread I bought from Lila&apos;s last time. Same colors.</q>
            </p>
          </div>
          <div className="bubble">
            <div className="source">— a customer · to Claude</div>
            <p className="text">
              <q>What time does my favorite ramen place close tonight, and can you tell them I&apos;m running late?</q>
            </p>
          </div>
        </div>

        <p className="problem-summary">
          AI assistants are ready to do this <strong>today</strong>. But they can
          only read your website like a brochure — they can&apos;t actually do
          anything on it. <strong>That&apos;s a missed sale every time.</strong>
        </p>
      </div>
    </section>
  );
}

export function BridgeAnalogy() {
  const ais = ["ChatGPT", "Claude", "Siri", "Gemini"];
  const businesses = [
    { name: "Shopify",   ico: <IStore size={12} /> },
    { name: "Square",    ico: <ICalc size={12} /> },
    { name: "Calendly",  ico: <ICalendar size={12} /> },
    { name: "WordPress", ico: <IGlobe size={12} /> },
  ];

  return (
    <section className="bridge-section section-cream" id="bridge">
      <div className="container">
        <div className="grid">
          <div className="usb-diagram" aria-hidden="true">
            <div className="usb-row">
              {ais.map((a) => (
                <div className="usb-chip" key={a}>
                  <span className="badge">{a[0]}</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>

            <div className="usb-lines">
              <svg viewBox="0 0 600 60" preserveAspectRatio="none">
                {[0.1, 0.36, 0.64, 0.9].map((x, i) => (
                  <path
                    key={i}
                    d={`M ${600 * x} 0 C ${600 * x} 30, 300 30, 300 60`}
                    stroke="#E8E3DA"
                    strokeWidth="1.4"
                    fill="none"
                  />
                ))}
              </svg>
            </div>

            <div className="usb-hub">
              <div className="hub-label">MCPBuilder.ai</div>
              <div className="hub-name">One bridge. Every connection.</div>
            </div>

            <div className="usb-lines">
              <svg viewBox="0 0 600 60" preserveAspectRatio="none">
                {[0.1, 0.36, 0.64, 0.9].map((x, i) => (
                  <path
                    key={i}
                    d={`M 300 0 C 300 30, ${600 * x} 30, ${600 * x} 60`}
                    stroke="#E8E3DA"
                    strokeWidth="1.4"
                    fill="none"
                  />
                ))}
              </svg>
            </div>

            <div className="usb-row">
              {businesses.map((b) => (
                <div className="usb-chip biz" key={b.name}>
                  <span className="badge">{b.ico}</span>
                  <span>{b.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bridge-copy">
            <span className="eyebrow"><span className="dot"></span>The analogy</span>
            <h2 style={{ marginTop: 16 }}>Like USB-C, but for AI.</h2>
            <p className="lede" style={{ marginTop: 20 }}>
              Before USB-C, every device had its own cable. Now one port fits
              everything. We do the same thing for AI: one link from your
              website that every AI assistant knows how to use.
            </p>
            <p className="lede" style={{ marginTop: 16 }}>
              You connect once. ChatGPT, Claude, Siri, and the next ten
              assistants that show up — they all just work.
            </p>
            <a className="btn btn-link" href="#how" style={{ marginTop: 18 }}>
              See how the connection works{" "}
              <span className="arrow"><IArrow size={18} /></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="section-cream" id="how">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot"></span>How it works</span>
          <h2 style={{ marginTop: 16 }}>Three steps. Sixty seconds.</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            No code. No setup calls. No new dashboard to log into every day.
          </p>
        </div>

        <div className="steps">
          <div className="step-card">
            <div className="step-num">01 / PASTE</div>
            <h3>Paste your website.</h3>
            <p>
              Drop in your URL. We scan your site and recognize what kind of
              business you run.
            </p>
            <div className="step-visual">
              <div className="mini-url">
                <span className="dot-r"></span>
                <span style={{ color: "var(--muted-fg)" }}>https://</span>
                <span style={{ color: "var(--ink)" }}>lilasembroidery.com</span>
                <span className="cursor"></span>
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">02 / REVIEW</div>
            <h3>Review what AI can do.</h3>
            <p>
              We show you a plain-English list of what AI can do for your
              customers. Toggle anything off you don&apos;t want.
            </p>
            <div className="step-visual">
              <div className="review">
                <div className="row">
                  <span className="check"><ICheck size={12} /></span>
                  <span>Search products by name or photo</span>
                </div>
                <div className="row">
                  <span className="check"><ICheck size={12} /></span>
                  <span>Take orders &amp; process checkout</span>
                </div>
                <div className="row">
                  <span className="check"><ICheck size={12} /></span>
                  <span>Check order status</span>
                </div>
                <div className="row">
                  <span className="check off"></span>
                  <span style={{ color: "var(--muted-fg)" }}>Refund processing — off</span>
                </div>
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-num">03 / SHARE</div>
            <h3>Get your AI link.</h3>
            <p>
              We give you one short link. Add it to your site footer. From that
              moment, every AI assistant can work with your business.
            </p>
            <div className="step-visual">
              <div className="linkbox">
                <span className="pre">ai://</span>
                <span>lilas.mcp.link</span>
                <span className="copy"><ICopy size={11} /> copy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### `components/marketing/sections-more.tsx`

```tsx
import { Logo } from "./logo";
import {
  IArrow,
  IBook,
  ICalc,
  ICalendar,
  ICamera,
  ICompass,
  IDumbbell,
  IHeart,
  IHome,
  IPlay,
  IScissors,
  IStore,
  ITrophy,
  ITruck,
  IUsers,
  IUtensils,
  IClock,
  IWrench,
} from "./icons";

type ChatMsg =
  | { kind: "in" | "out"; text: string }
  | { kind: "system"; text: string };

function ChatMockup({
  name,
  role,
  avatarChar,
  avatarBg,
  messages,
}: {
  name: string;
  role: string;
  avatarChar: string;
  avatarBg: string;
  messages: ChatMsg[];
}) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-head">
          <div className="avatar" style={{ background: avatarBg }}>{avatarChar}</div>
          <div className="meta">
            <span className="name">{name}</span>
            <span className="role">{role}</span>
          </div>
        </div>
        <div className="msg-stack">
          {messages.map((m, i) => {
            if (m.kind === "system") {
              return (
                <div key={i} className="msg system">
                  <span className="dot"></span>
                  {m.text}
                </div>
              );
            }
            return <div key={i} className={`msg ${m.kind}`}>{m.text}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

export function Chats() {
  return (
    <section className="section-soft" id="examples">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot"></span>What it feels like</span>
          <h2 style={{ marginTop: 16 }}>Real customers. Real AI. Real bookings.</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            A peek at three conversations that happen on your behalf, while you
            focus on the work.
          </p>
        </div>

        <div className="chat-grid">
          <div>
            <p className="chat-tag">
              <IDumbbell size={14} style={{ color: "var(--action)" }} /> YOGA STUDIO · BOOKING
            </p>
            <ChatMockup
              name="Asha"
              role="ChatGPT"
              avatarChar="A"
              avatarBg="linear-gradient(135deg,#FF8A60,#FF6B35)"
              messages={[
                { kind: "in", text: "Any spots at Bright Yoga this Saturday morning?" },
                { kind: "out", text: "Two openings — 8am Vinyasa and 9:30am Slow Flow. Want me to book one?" },
                { kind: "in", text: "9:30 please." },
                { kind: "system", text: "Booked · Sat 9:30 AM · receipt sent" },
              ]}
            />
          </div>
          <div>
            <p className="chat-tag">
              <IScissors size={14} style={{ color: "var(--action)" }} /> EMBROIDERY SHOP · REORDER
            </p>
            <ChatMockup
              name="Marcus"
              role="Siri"
              avatarChar="M"
              avatarBg="linear-gradient(135deg,#7BAE92,#2D8659)"
              messages={[
                { kind: "in", text: "Reorder my last embroidery thread set from Lila's." },
                { kind: "out", text: "Same six gold threads from May 12, shipped to home — $48. Confirm?" },
                { kind: "in", text: "Yes." },
                { kind: "system", text: "Order placed · ships tomorrow" },
              ]}
            />
          </div>
          <div>
            <p className="chat-tag">
              <ICalc size={14} style={{ color: "var(--action)" }} /> ACCOUNTING · REMINDER
            </p>
            <ChatMockup
              name="Priya"
              role="Claude"
              avatarChar="P"
              avatarBg="linear-gradient(135deg,#F5A623,#F2873A)"
              messages={[
                { kind: "in", text: "Did Carter & Co. send me the Q3 receipts yet?" },
                { kind: "out", text: "Not yet — last upload was Aug 14. Want me to nudge them?" },
                { kind: "in", text: "Please." },
                { kind: "system", text: "Reminder sent · they'll get a polite note today" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Benefits() {
  const items = [
    {
      icon: <IUsers size={22} />,
      title: "Reach the new wave of customers.",
      body: "Over 600 million people now ask AI before they search. If your business is AI-ready, you show up where they actually look.",
    },
    {
      icon: <ITrophy size={22} />,
      title: "Stand out from your competition.",
      body: "Most small businesses haven't made this move yet. When AI can book you and not them, customers default to you.",
    },
    {
      icon: <IClock size={22} />,
      title: "Free up your team.",
      body: "Routine questions and reorders get handled around the clock — no extra chat widget, no part-time hire.",
    },
    {
      icon: <ICompass size={22} />,
      title: "Future-proof in one move.",
      body: "Connect once. Every AI assistant that exists now — and the next ten that show up — will know how to work with you.",
    },
  ];
  return (
    <section className="section-cream" id="benefits">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot"></span>Why it matters</span>
          <h2 style={{ marginTop: 16 }}>
            The shift is happening. You can be ready in a coffee break.
          </h2>
        </div>
        <div className="benefits">
          {items.map((it, i) => (
            <div className="benefit" key={i}>
              <div className="icon-wrap">{it.icon}</div>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Demo() {
  return (
    <section className="section-soft" id="demo">
      <div className="container">
        <div className="demo-grid">
          <div>
            <span className="eyebrow"><span className="dot"></span>See it work</span>
            <h2 style={{ marginTop: 16 }}>See it work in 60 seconds.</h2>
            <p className="lede" style={{ marginTop: 16, maxWidth: 460 }}>
              A real walkthrough — paste a URL, review the actions, drop in the
              link. We watch a customer ask ChatGPT to place an order. It works.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <a href="#start" className="btn btn-primary">
                Try it on your site <IArrow size={18} />
              </a>
              <a href="#talk" className="btn btn-ghost">Talk to a human</a>
            </div>
          </div>

          <div className="video-frame">
            <div className="video-tag">60-second walkthrough</div>
            <div className="skeleton">
              <button className="play" aria-label="Play demo video" type="button">
                <IPlay size={28} style={{ color: "#1E1B1A", marginLeft: 4 }} />
              </button>
            </div>
            <div className="video-meta">00:00 / 01:02 · MCPBuilder demo</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Industries() {
  const items = [
    { i: <IStore size={18} />,    name: "Online shops",     desc: "Search, reorder, checkout — all via voice." },
    { i: <ICalendar size={18} />, name: "Salons & spas",    desc: "Bookings, reschedules, and reminders." },
    { i: <IUtensils size={18} />, name: "Restaurants",      desc: "Hours, reservations, takeout orders." },
    { i: <IBook size={18} />,     name: "Coaches & tutors", desc: "Find a slot, pay, get the link." },
    { i: <IHeart size={18} />,    name: "Wellness",         desc: "Class signups and intake forms." },
    { i: <IDumbbell size={18} />, name: "Gyms & studios",   desc: "Membership, drop-ins, class plans." },
    { i: <IScissors size={18} />, name: "Makers & crafts",  desc: "Custom orders and reorders." },
    { i: <ICamera size={18} />,   name: "Photographers",    desc: "Quotes, sessions, gallery sharing." },
    { i: <IWrench size={18} />,   name: "Home services",    desc: "Quotes, visits, follow-ups." },
    { i: <ICalc size={18} />,     name: "Accountants",      desc: "Document chase, reminders, intake." },
    { i: <IHome size={18} />,     name: "Real estate",      desc: "Tours, listings, paperwork." },
    { i: <ITruck size={18} />,    name: "Local delivery",   desc: "Dispatch, ETAs, tracking." },
  ];
  return (
    <section className="section-cream" id="industries">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot"></span>Built for</span>
          <h2 style={{ marginTop: 16 }}>
            If a customer can ask for it, we can connect it.
          </h2>
        </div>
        <div className="industries">
          {items.map((it, i) => (
            <div className="industry" key={i}>
              <div className="ico">{it.i}</div>
              <div className="name">{it.name}</div>
              <div className="desc">{it.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section style={{ padding: "80px 0 100px" }} className="section-cream">
      <div className="cta-band">
        <span className="eyebrow" style={{ color: "rgba(250,248,245,0.7)" }}>
          <span className="dot"></span>Get started
        </span>
        <h2 style={{ marginTop: 16 }}>
          Your shop. Every AI assistant. One coffee break.
        </h2>
        <p className="lede">
          Paste your URL. We&apos;ll show you exactly what AI will be able to do
          for your business — before you commit to anything.
        </p>
        <div className="actions">
          <a className="btn btn-primary" href="#start">
            Make my site AI-ready <IArrow size={18} />
          </a>
          <a className="btn btn-ghost" href="#talk">
            Book a 15-minute walkthrough
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer section-cream">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo />
            <p className="tag">
              The bridge between your business and every AI assistant your
              customers use.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li><a href="#how">How it works</a></li>
              <li><a href="#industries">Industries</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#changelog">What&apos;s new</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#customers">Customers</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              <li><a href="#guides">Guides</a></li>
              <li><a href="#help">Help center</a></li>
              <li><a href="#trust">Trust &amp; security</a></li>
              <li><a href="#status">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="copy">
          <span>© 2026 MCPBuilder, Inc.</span>
          <span>Made for the businesses AI forgot.</span>
        </div>
      </div>
    </footer>
  );
}
```

### `components/marketing/faq.tsx`

```tsx
"use client";

import { useState } from "react";
import { IPlus } from "./icons";

const ITEMS = [
  {
    q: "I'm not technical. Will I get stuck?",
    a: "No. You paste your website address; we do the rest. The whole thing takes less than a minute, with no code and no settings to wrestle with.",
  },
  {
    q: "Which AI assistants does this work with?",
    a: "All the major ones — ChatGPT, Claude, Siri, Gemini — and any new assistant that follows the open standard. Connect once; they all know what to do.",
  },
  {
    q: "Is my customer data safe?",
    a: "Yes. Your data stays on your existing systems. We just translate the conversation between AI and your shop. You choose exactly what AI is allowed to see and do.",
  },
  {
    q: "What if I want to turn something off?",
    a: "Every action AI can take has a clear on/off switch. Don't want refunds handled? Flip it off. Want appointments only between 9 and 5? Tell us once.",
  },
  {
    q: "Does this replace my website?",
    a: "Not at all. Your website stays exactly as it is. We add a single link in the footer that AI assistants use behind the scenes.",
  },
  {
    q: "How much does it cost?",
    a: "Free to try. Paid plans start at $19/month, and most small businesses stay on the lowest tier. No setup fees, no contracts.",
  },
  {
    q: "What systems do you support?",
    a: "Shopify, Square, WooCommerce, Calendly, Acuity, Stripe, WordPress, and growing every week. If you don't see yours, ask — we probably support it.",
  },
  {
    q: "What's an 'MCP' anyway?",
    a: "It's the name of the open standard that makes AI ↔ business connections work. You don't need to know more than that — same way you don't need to know what HTTPS is to use the web.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="section-cream" id="faq">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="dot"></span>Questions</span>
          <h2 style={{ marginTop: 16 }}>Things people ask before they paste their URL.</h2>
        </div>
        <div className="faq">
          {ITEMS.map((it, i) => (
            <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
              <button
                className="faq-q"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span>{it.q}</span>
                <IPlus size={20} className="plus" />
              </button>
              <div className="faq-a">
                <div className="faq-a-inner">{it.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Step 6 — Landing page

Overwrite `app/page.tsx`:

```tsx
import { Header } from "@/components/marketing/header";
import {
  BridgeAnalogy,
  Hero,
  HowItWorks,
  Problem,
} from "@/components/marketing/sections";
import {
  Benefits,
  Chats,
  Demo,
  FinalCTA,
  Footer,
  Industries,
} from "@/components/marketing/sections-more";
import { FAQ } from "@/components/marketing/faq";

export default function Home() {
  return (
    <div className="marketing" id="top">
      <Header />
      <main>
        <Hero />
        <Problem />
        <BridgeAnalogy />
        <HowItWorks />
        <Chats />
        <Benefits />
        <Demo />
        <Industries />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
```

---

## Step 7 — App shell + progress stepper for inner pages

### `components/app-shell.tsx`

```tsx
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
```

### `components/progress-stepper.tsx`

If you don't have `lib/types.ts` defining `ScanStep` and `FetchProgress`, declare them inline at the top of this file:

```tsx
import { Check, X } from "lucide-react";

type ScanStep =
  | "fetching_source"
  | "classifying"
  | "extracting_actions"
  | "designing_tools"
  | "complete"
  | "failed";

type FetchProgress = { fetched: number; total: number };

type Step = {
  key: Exclude<ScanStep, "complete" | "failed">;
  label: string;
};

const STEPS: Step[] = [
  { key: "fetching_source", label: "Reading source" },
  { key: "classifying", label: "Classifying website" },
  { key: "extracting_actions", label: "Extracting actions" },
  { key: "designing_tools", label: "Designing tools" },
];

function indexOf(step: ScanStep | null | undefined): number {
  if (!step) return 0;
  if (step === "complete") return STEPS.length;
  if (step === "failed") return 0;
  const i = STEPS.findIndex((s) => s.key === step);
  return i === -1 ? 0 : i;
}

export function ProgressStepper({
  currentStep,
  failed = false,
  fetchProgress,
}: {
  currentStep: ScanStep | null | undefined;
  failed?: boolean;
  fetchProgress?: FetchProgress | null;
}) {
  const idx = indexOf(currentStep);
  const allDone = currentStep === "complete";

  return (
    <ol className="space-y-3">
      {STEPS.map((step, i) => {
        const done = allDone || i < idx;
        const active = i === idx && !failed && !allDone;
        const errored = i === idx && failed;
        const showCounter =
          active && step.key === "fetching_source" && !!fetchProgress;

        const dot = done
          ? "bg-[var(--sage)] text-white border-transparent"
          : active
            ? "bg-[var(--soft)] text-[var(--coral)] border-[var(--coral)]/30"
            : errored
              ? "bg-destructive text-white border-transparent"
              : "bg-muted text-muted-foreground border-border";

        return (
          <li
            key={step.key}
            className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-[0_1px_2px_rgba(30,27,26,0.04)]"
          >
            <span
              className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${dot}`}
            >
              {done ? (
                <Check className="size-4" />
              ) : errored ? (
                <X className="size-4" />
              ) : active ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                i + 1
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={
                  done || active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }
              >
                {step.label}
              </p>
              {showCounter && fetchProgress!.total > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                  Fetched {fetchProgress!.fetched} of {fetchProgress!.total}{" "}
                  files
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
```

---

## Step 8 — Inner pages (5 routes)

These pages are placeholders for the design — they reference the AppShell and PageHeading. The form components inside (`ToolList`, `ConnectForm`, `EndpointMapForm`, `InstallSnippets`) are implementation-specific and not part of the replica spec; substitute your own.

### `app/scan/[id]/page.tsx`

```tsx
"use client";

import { use } from "react";
import Link from "next/link";
import { AppShell, PageHeading } from "@/components/app-shell";
import { ProgressStepper } from "@/components/progress-stepper";

export default function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AppShell width="xl" crumbs={[{ label: "Scan" }]}>
      <PageHeading
        eyebrow="Building your bridge"
        title="Building your MCP server"
        body="We're reading the code and designing the agent tools. Hang tight — this usually takes under a minute."
      />
      <ProgressStepper currentStep={"fetching_source"} fetchProgress={{ fetched: 0, total: 0 }} />
      <p className="mt-6 text-xs text-muted-foreground">Project ID: {id}</p>
    </AppShell>
  );
}
```

### `app/confirm/[id]/page.tsx`

```tsx
import { AppShell, PageHeading } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell width="2xl" crumbs={[{ label: "Review" }]}>
      <PageHeading
        eyebrow="Step 02 / Review"
        title="Review your tools"
        body="These are the actions AI agents will be able to take on your site. Rename them, edit descriptions, or toggle write actions off."
      />
      {/* <ToolList projectId={id} ... /> */}
      <p className="text-xs text-muted-foreground">Project ID: {id}</p>
    </AppShell>
  );
}
```

### `app/connect/[id]/page.tsx`

```tsx
import { AppShell, PageHeading } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function ConnectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell
      width="2xl"
      crumbs={[
        { label: "Review", href: `/confirm/${id}` },
        { label: "Connect" },
      ]}
    >
      <PageHeading
        eyebrow="Step 03 / Connect"
        title="Connect your backend"
        body="Where does your application's API live, and how should the AI agent authenticate to it? Credentials are baked into your private MCP Worker — only that Worker can use them."
      />
      {/* <ConnectForm projectId={id} ... /> */}
    </AppShell>
  );
}
```

### `app/map/[id]/page.tsx`

```tsx
import { AppShell, PageHeading } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function MapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell
      width="3xl"
      crumbs={[
        { label: "Review", href: `/confirm/${id}` },
        { label: "Connect", href: `/connect/${id}` },
        { label: "Map" },
      ]}
    >
      <PageHeading
        eyebrow="Step 04 / Map endpoints"
        title="Map your tool endpoints"
        body="Review the inferred URL paths and HTTP methods for each tool. Test them all before deploying — we refuse to deploy a Worker if any tool test fails."
      />
      {/* <EndpointMapForm projectId={id} ... /> */}
    </AppShell>
  );
}
```

### `app/success/[id]/page.tsx`

```tsx
import Link from "next/link";
import { Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell width="3xl" crumbs={[{ label: "Live" }]}>
      <div className="text-center">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-[var(--sage)] text-white shadow-[0_8px_20px_rgba(45,134,89,0.25)]">
          <Check className="size-7" />
        </div>
        <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Your MCP is live
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          Project <span className="font-medium text-foreground">{id}</span> is now available to any AI agent.
        </p>
      </div>

      {/* <InstallSnippets mcpUrl={...} /> */}

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Build another
        </Link>
      </div>
    </AppShell>
  );
}
```

---

## Step 9 — Verify

Run these from the project root and make sure both succeed:

```bash
npx tsc --noEmit
npm run build
```

Expected build output (route sizes will differ by a few kB):

```
Route (app)                          Size       First Load JS
┌ ○ /                                ~3 kB      ~115 kB
├ ƒ /confirm/[id]                    ~7 kB      ~134 kB
├ ƒ /connect/[id]                    ~4 kB      ~133 kB
├ ƒ /map/[id]                        ~4 kB      ~134 kB
├ ƒ /scan/[id]                       ~4 kB      ~122 kB
└ ƒ /success/[id]                    ~3 kB      ~130 kB
```

Then `npm run dev` and visit:

- `http://localhost:3000` — landing page, with the live bridge diagram on the right of the hero and the coral CTA below the URL input
- `http://localhost:3000/scan/any-id` — inner page with the sticky cream header and the 4-step progress stepper
- `http://localhost:3000/confirm/any-id`, `/connect/any-id`, `/map/any-id`, `/success/any-id` — placeholder inner pages confirming the AppShell renders for every route

If anything looks off, the most common gotchas:

- **`.next` cache from a previous build leaking** — delete `.next/` and restart `npm run dev`.
- **Fonts not loading** — check that the four `next/font/google` imports in `app/layout.tsx` are present and their CSS variables (`--font-inter`, `--font-inter-tight`, `--font-jetbrains-mono`) are listed in `globals.css` under `@theme inline`.
- **Marketing CSS leaking into inner pages** — make sure every selector in `marketing.css` starts with `.marketing` and the landing page wraps everything in `<div className="marketing">`.

You're done.
