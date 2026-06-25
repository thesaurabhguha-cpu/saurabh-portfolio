"use client";
import Link from "next/link";

const cards = [
  {
    href: "/churn",
    emoji: "📉",
    title: "Churn Risk Predictor",
    desc: "Real-time health scoring across 1,356 accounts. Filter by risk, plan, industry. Override risk labels manually.",
    tags: ["Health Scores", "Risk Signals", "Filter + Search", "Manual Override"],
  },
  {
    href: "/qbr",
    emoji: "📊",
    title: "QBR Generator",
    desc: "Select any account, pull live metrics from DB, generate an executive-ready QBR outline using AI in seconds.",
    tags: ["AI-Powered", "Live DB Pull", "Executive Format", "Copy to Clipboard"],
  },
];

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      background: "var(--bg)"
    }}>
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <div style={{
          display: "inline-block",
          background: "rgba(99,102,241,0.1)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "6px",
          padding: "4px 12px",
          fontSize: "11px",
          fontWeight: 600,
          color: "#818cf8",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "24px"
        }}>
          CSM Portfolio · Saurabh Guha
        </div>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 700,
          color: "var(--text)",
          margin: "0 0 16px",
          letterSpacing: "-0.03em",
          lineHeight: 1.1
        }}>
          Customer Success<br />
          <span style={{ color: "var(--accent)" }}>Intelligence Platform</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "16px", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
          AI-powered tools built to demonstrate proactive churn prevention and executive reporting at scale. 1,356 live accounts.
        </p>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center", maxWidth: "800px" }}>
        {cards.map(card => (
          <Link key={card.href} href={card.href} style={{ textDecoration: "none", flex: "1", minWidth: "280px", maxWidth: "360px" }}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "32px",
              height: "100%",
              boxSizing: "border-box",
              transition: "border-color 0.2s"
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#6366f1"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}
            >
              <div style={{ fontSize: "28px", marginBottom: "16px" }}>{card.emoji}</div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                {card.title}
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0 0 24px", lineHeight: 1.5 }}>
                {card.desc}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {card.tags.map(t => (
                  <span key={t} style={{
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "3px 8px",
                    fontSize: "11px",
                    color: "var(--muted)"
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "60px", color: "var(--muted)", fontSize: "12px", textAlign: "center" }}>
        Built by Saurabh Guha · 1,356 accounts · NVIDIA LLaMA-3.3-70B
      </div>
    </div>
  );
}
