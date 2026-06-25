"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lead } from "../types";

function QBRContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("id");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [generating, setGenerating] = useState(false);
  const [qbr, setQbr] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/leads.json")
      .then(r => r.json())
      .then((data: Lead[]) => {
        setLeads(data);
        setLoading(false);
        if (preselectedId) {
          const found = data.find((l: Lead) => l.id === preselectedId);
          if (found) setSelected(found);
        }
      });
  }, [preselectedId]);

  const filtered = leads.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q);
  }).slice(0, 40);

  async function generate() {
    if (!selected) return;
    setGenerating(true);
    setQbr("");
    setError("");

    try {
      const res = await fetch("/api/qbr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: selected }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setQbr(data.qbr); }
    } catch (e) {
      setError(`Network error: ${e}`);
    } finally {
      setGenerating(false);
    }
  }

  function copyToClipboard() {
    if (!qbr) return;
    navigator.clipboard.writeText(qbr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function formatQBR(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (/^\d+\.\s+[A-Z]/.test(line) || /^#{1,3}\s/.test(line)) {
        const clean = line.replace(/^#{1,3}\s+/, "").replace(/^\d+\.\s+/, "");
        return (
          <div key={i} style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--accent-hover)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginTop: "20px",
            marginBottom: "6px",
            paddingBottom: "6px",
            borderBottom: "1px solid var(--border)"
          }}>{clean}</div>
        );
      }
      if (/^[-•*]\s/.test(line)) {
        return (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px", paddingLeft: "4px" }}>
            <span style={{ color: "var(--accent)", marginTop: "1px", flexShrink: 0 }}>▸</span>
            <span style={{ color: "var(--text)", fontSize: "13px", lineHeight: 1.6 }}>{line.replace(/^[-•*]\s/, "")}</span>
          </div>
        );
      }
      if (line.trim() === "") return <div key={i} style={{ height: "4px" }} />;
      return (
        <div key={i} style={{ color: "var(--text)", fontSize: "13px", lineHeight: 1.7, marginBottom: "4px" }}>{line}</div>
      );
    });
  }

  const riskColor = (r: string) => r === "High" ? "#ef4444" : r === "Medium" ? "#f59e0b" : "#22c55e";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Nav */}
      <div style={{
        borderBottom: "1px solid var(--border)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <Link href="/" style={{ color: "var(--muted)", fontSize: "13px", textDecoration: "none" }}>← Home</Link>
        <span style={{ color: "var(--border)" }}>|</span>
        <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>QBR Generator</span>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>Powered by NVIDIA · LLaMA-3.3-70B</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", minHeight: "calc(100vh - 53px)" }}>
        {/* Sidebar — Account Selector */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Select Account</div>
            <input
              placeholder="Search accounts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "8px 10px",
                color: "var(--text)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "20px", color: "var(--muted)", fontSize: "13px" }}>Loading…</div>
            ) : filtered.map(lead => (
              <div
                key={lead.id}
                onClick={() => { setSelected(lead); setQbr(""); setError(""); }}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  background: selected?.id === lead.id ? "var(--surface2)" : "transparent",
                  transition: "background 0.1s"
                }}
                onMouseEnter={e => {
                  if (selected?.id !== lead.id)
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                }}
                onMouseLeave={e => {
                  if (selected?.id !== lead.id)
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>{lead.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>{lead.company}</div>
                  </div>
                  <div style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: riskColor(lead.churn_risk),
                    padding: "2px 5px",
                    background: `${riskColor(lead.churn_risk)}18`,
                    border: `1px solid ${riskColor(lead.churn_risk)}30`,
                    borderRadius: "3px",
                    textTransform: "uppercase",
                    flexShrink: 0,
                    marginLeft: "6px"
                  }}>{lead.churn_risk}</div>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                    Health {lead.health_score}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>·</span>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                    {lead.plan}
                  </span>
                  {lead.arr > 0 && (
                    <>
                      <span style={{ fontSize: "10px", color: "var(--muted)" }}>·</span>
                      <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                        ${lead.arr.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
            {!loading && filtered.length === 0 && (
              <div style={{ padding: "20px", color: "var(--muted)", fontSize: "13px" }}>No accounts found</div>
            )}
            {!loading && filtered.length === 40 && (
              <div style={{ padding: "12px 16px", color: "var(--muted)", fontSize: "11px" }}>Showing top 40 — search to narrow</div>
            )}
          </div>
        </div>

        {/* Main — QBR Output */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Account Summary Bar */}
          {selected ? (
            <div style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap"
            }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>{selected.name}</div>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>{selected.company} · {selected.industry}</div>
              </div>
              <div style={{ display: "flex", gap: "16px", marginLeft: "auto", flexWrap: "wrap" }}>
                {[
                  { label: "Health", value: `${selected.health_score}/100` },
                  { label: "Risk", value: selected.churn_risk, color: riskColor(selected.churn_risk) },
                  { label: "Plan", value: selected.plan },
                  { label: "ARR", value: selected.arr > 0 ? `$${selected.arr.toLocaleString()}` : "Free" },
                  { label: "NPS", value: `${selected.nps_score}/10` },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: s.color || "var(--text)" }}>{s.value}</div>
                  </div>
                ))}
                <button
                  onClick={generate}
                  disabled={generating}
                  style={{
                    background: generating ? "var(--surface2)" : "var(--accent)",
                    border: "none",
                    borderRadius: "7px",
                    color: generating ? "var(--muted)" : "#fff",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: generating ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                    whiteSpace: "nowrap"
                  }}
                >
                  {generating ? "Generating…" : qbr ? "Regenerate" : "Generate QBR"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--muted)",
              fontSize: "13px"
            }}>
              ← Select an account to generate a QBR
            </div>
          )}

          {/* Output Area */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto" }} ref={outputRef}>
            {!selected && !qbr && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--muted)",
                textAlign: "center",
                gap: "12px"
              }}>
                <div style={{ fontSize: "36px" }}>📊</div>
                <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text)" }}>QBR Generator</div>
                <div style={{ fontSize: "13px", maxWidth: "320px", lineHeight: 1.6 }}>
                  Select an account from the left, then hit Generate QBR. AI produces an executive-ready outline in seconds using live account data.
                </div>
              </div>
            )}

            {selected && !qbr && !generating && !error && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--muted)",
                textAlign: "center",
                gap: "12px"
              }}>
                <div style={{ fontSize: "28px" }}>⚡</div>
                <div style={{ fontSize: "14px", color: "var(--text)", fontWeight: 500 }}>Ready for {selected.name}</div>
                <div style={{ fontSize: "13px" }}>Click Generate QBR to produce the outline</div>
              </div>
            )}

            {generating && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: "16px"
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  border: "3px solid var(--border)",
                  borderTopColor: "var(--accent)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }} />
                <div style={{ color: "var(--muted)", fontSize: "13px" }}>
                  LLaMA-3.3-70B generating QBR for {selected?.company}…
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "8px",
                padding: "16px",
                color: "#f87171",
                fontSize: "13px"
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {qbr && !generating && (
              <div>
                {/* QBR Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border)"
                }}>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
                      QBR — {selected?.company}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                      Generated {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · LLaMA-3.3-70B
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={copyToClipboard}
                      style={{
                        background: copied ? "rgba(34,197,94,0.15)" : "var(--surface2)",
                        border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                        borderRadius: "6px",
                        color: copied ? "#22c55e" : "var(--muted)",
                        padding: "7px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Rendered QBR */}
                <div style={{ maxWidth: "680px" }}>
                  {formatQBR(qbr)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QBRPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ color: "var(--muted)", fontSize: "14px" }}>Loading…</div>
      </div>
    }>
      <QBRContent />
    </Suspense>
  );
}
