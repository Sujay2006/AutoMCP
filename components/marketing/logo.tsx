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
