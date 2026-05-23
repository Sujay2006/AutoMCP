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
