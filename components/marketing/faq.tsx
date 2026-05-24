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
    a: (
      <>
        The Model Context Protocol (MCP), a new standard for connecting AI assistants to the systems where data lives, including content repositories, business tools, and development environments. Its aim is to help frontier models produce better, more relevant responses.{" "}
        <a
          href="https://www.anthropic.com/news/model-context-protocol"
          target="_blank"
          rel="noopener noreferrer"
        >
          know more
        </a>
      </>
    ),
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
