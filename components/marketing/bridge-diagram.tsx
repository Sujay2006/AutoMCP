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
