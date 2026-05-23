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
