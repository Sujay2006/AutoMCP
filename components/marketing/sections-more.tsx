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
