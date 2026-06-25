"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Lead } from "../types";

const RISK_ORDER = { High: 0, Medium: 1, Low: 2 };

function HealthBar({ score }: { score: number }) {
  const color = score >= 66 ? "#22c55e" : score >= 41 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div className="health-bar-bg" style={{ flex: 1 }}>
        <div className="health-bar" style={{ width: `${score}%`, background: color }} />
      </div>
      <span style={{ fontSize: "12px", color, fontWeight: 600, minWidth: "26px" }}>{score}</span>
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  return (
    <span className={`badge badge-${risk.toLowerCase()}`}>{risk}</span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span className={`badge badge-${plan.toLowerCase()}`}>{plan}</span>
  );
}

function SignalDots({ lead }: { lead: Lead }) {
  const signals = [
    { key: "login_frequency_drop", label: "Login↓" },
    { key: "feature_usage_drop", label: "Usage↓" },
    { key: "support_ticket_spike", label: "Tickets↑" },
    { key: "payment_delay", label: "Payment" },
  ];
  return (
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
      {signals.map(s => {
        const active = lead[s.key as keyof Lead] as boolean;
        return active ? (
          <span key={s.key} style={{
            fontSize: "10px",
            padding: "2px 5px",
            borderRadius: "3px",
            background: "rgba(239,68,68,0.12)",
            color: "#f87171",
            border: "1px solid rgba(239,68,68,0.2)"
          }}>{s.label}</span>
        ) : null;
      })}
      {!signals.some(s => lead[s.key as keyof Lead]) && (
        <span style={{ fontSize: "10px", color: "var(--muted)" }}>—</span>
      )}
    </div>
  );
}

export default function ChurnPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [planFilter, setPlanFilter] = useState<string>("All");
  const [industryFilter, setIndustryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("risk");
  const [page, setPage] = useState(1);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const PAGE_SIZE = 50;

  useEffect(() => {
    fetch("/leads.json")
      .then(r => r.json())
      .then((data: Lead[]) => { setLeads(data); setLoading(false); });
  }, []);

  const industries = useMemo(() => {
    const set = new Set(leads.map(l => l.industry));
    return ["All", ...Array.from(set).sort()];
  }, [leads]);

  const filtered = useMemo(() => {
    let out = leads.map(l => ({
      ...l,
      churn_risk: (overrides[l.id] as Lead["churn_risk"]) || l.churn_risk
    }));

    if (search) {
      const q = search.toLowerCase();
      out = out.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
      );
    }
    if (riskFilter !== "All") out = out.filter(l => l.churn_risk === riskFilter);
    if (planFilter !== "All") out = out.filter(l => l.plan === planFilter);
    if (industryFilter !== "All") out = out.filter(l => l.industry === industryFilter);

    out.sort((a, b) => {
      if (sortBy === "risk") return RISK_ORDER[a.churn_risk] - RISK_ORDER[b.churn_risk];
      if (sortBy === "health") return a.health_score - b.health_score;
      if (sortBy === "arr") return b.arr - a.arr;
      if (sortBy === "nps") return a.nps_score - b.nps_score;
      return 0;
    });

    return out;
  }, [leads, search, riskFilter, planFilter, industryFilter, sortBy, overrides]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const stats = useMemo(() => ({
    high: filtered.filter(l => l.churn_risk === "High").length,
    medium: filtered.filter(l => l.churn_risk === "Medium").length,
    low: filtered.filter(l => l.churn_risk === "Low").length,
    atRiskArr: filtered.filter(l => l.churn_risk === "High").reduce((s, l) => s + l.arr, 0),
    avgHealth: Math.round(filtered.reduce((s, l) => s + l.health_score, 0) / (filtered.length || 1)),
  }), [filtered]);

  function toggleOverride(id: string, current: string) {
    const order = ["High", "Medium", "Low"];
    const next = order[(order.indexOf(current) + 1) % 3];
    setOverrides(prev => ({ ...prev, [id]: next }));
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ color: "var(--muted)", fontSize: "14px" }}>Loading 1,356 accounts…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "0" }}>
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
        <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>Churn Risk Predictor</span>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>{filtered.length} accounts</span>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "High Risk", value: stats.high, color: "#ef4444" },
            { label: "Medium Risk", value: stats.medium, color: "#f59e0b" },
            { label: "Healthy", value: stats.low, color: "#22c55e" },
            { label: "At-Risk ARR", value: `$${(stats.atRiskArr / 1000).toFixed(0)}K`, color: "#ef4444" },
            { label: "Avg Health", value: `${stats.avgHealth}/100`, color: "var(--accent)" },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "16px",
            }}>
              <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
          <input
            placeholder="Search name, company, email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "8px 12px",
              color: "var(--text)",
              fontSize: "13px",
              outline: "none",
              width: "240px"
            }}
          />
          {[
            { label: "Risk", value: riskFilter, options: ["All", "High", "Medium", "Low"], setter: (v: string) => { setRiskFilter(v); setPage(1); } },
            { label: "Plan", value: planFilter, options: ["All", "Free", "Pro", "Enterprise"], setter: (v: string) => { setPlanFilter(v); setPage(1); } },
            { label: "Industry", value: industryFilter, options: industries, setter: (v: string) => { setIndustryFilter(v); setPage(1); } },
            { label: "Sort", value: sortBy, options: ["risk", "health", "arr", "nps"], setter: (v: string) => setSortBy(v) },
          ].map(f => (
            <select
              key={f.label}
              value={f.value}
              onChange={e => f.setter(e.target.value)}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "8px 10px",
                color: "var(--text)",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer"
              }}
            >
              {f.options.map(o => <option key={o} value={o}>{f.label === "Sort" ? `Sort: ${o}` : o}</option>)}
            </select>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Account", "Plan", "Industry", "Health", "Risk", "NPS", "ARR", "Last Login", "Signals", "Override"].map(h => (
                    <th key={h} style={{
                      padding: "10px 14px",
                      textAlign: "left",
                      color: "var(--muted)",
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((lead, i) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    style={{
                      borderBottom: i < paginated.length - 1 ? "1px solid var(--border)" : "none",
                      cursor: "pointer",
                      transition: "background 0.1s"
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--surface2)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontWeight: 500, color: "var(--text)" }}>{lead.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--muted)" }}>{lead.company}</div>
                    </td>
                    <td style={{ padding: "10px 14px" }}><PlanBadge plan={lead.plan} /></td>
                    <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: "12px" }}>{lead.industry}</td>
                    <td style={{ padding: "10px 14px", minWidth: "100px" }}><HealthBar score={lead.health_score} /></td>
                    <td style={{ padding: "10px 14px" }}><RiskBadge risk={lead.churn_risk} /></td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: lead.nps_score >= 8 ? "#22c55e" : lead.nps_score >= 5 ? "#f59e0b" : "#ef4444" }}>{lead.nps_score}</td>
                    <td style={{ padding: "10px 14px", color: "var(--text)" }}>
                      {lead.arr > 0 ? `$${lead.arr.toLocaleString()}` : <span style={{ color: "var(--muted)" }}>Free</span>}
                    </td>
                    <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: "12px", whiteSpace: "nowrap" }}>
                      {lead.last_login_date}
                    </td>
                    <td style={{ padding: "10px 14px" }}><SignalDots lead={lead} /></td>
                    <td style={{ padding: "10px 14px" }}>
                      <button
                        onClick={e => { e.stopPropagation(); toggleOverride(lead.id, lead.churn_risk); }}
                        style={{
                          background: "var(--surface2)",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          color: "var(--muted)",
                          fontSize: "11px",
                          padding: "3px 8px",
                          cursor: "pointer",
                        }}
                      >
                        {overrides[lead.id] ? "⚡ Manual" : "Override"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
          <span style={{ color: "var(--muted)", fontSize: "13px" }}>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: page === 1 ? "var(--muted)" : "var(--text)",
                borderRadius: "5px",
                padding: "6px 12px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontSize: "13px"
              }}
            >← Prev</button>
            <span style={{ padding: "6px 12px", color: "var(--muted)", fontSize: "13px" }}>
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: page === totalPages ? "var(--muted)" : "var(--text)",
                borderRadius: "5px",
                padding: "6px 12px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                fontSize: "13px"
              }}
            >Next →</button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLead && (
        <div
          onClick={() => setSelectedLead(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "28px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>{selectedLead.name}</h2>
                <div style={{ color: "var(--muted)", fontSize: "13px", marginTop: "4px" }}>{selectedLead.company} · {selectedLead.email}</div>
              </div>
              <button onClick={() => setSelectedLead(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "Churn Risk", value: <RiskBadge risk={(overrides[selectedLead.id] as string) || selectedLead.churn_risk} /> },
                { label: "Plan", value: <PlanBadge plan={selectedLead.plan} /> },
                { label: "Industry", value: selectedLead.industry },
                { label: "ARR", value: selectedLead.arr > 0 ? `$${selectedLead.arr.toLocaleString()}` : "Free" },
                { label: "NPS Score", value: selectedLead.nps_score },
                { label: "Last Login", value: selectedLead.last_login_date },
                { label: "Created", value: selectedLead.created_at },
                { label: "Account ID", value: selectedLead.id },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "var(--surface2)", borderRadius: "6px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Health Score</div>
              <HealthBar score={selectedLead.health_score} />
            </div>

            <div>
              <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Risk Signals</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[
                  ["Login Frequency Drop", selectedLead.login_frequency_drop],
                  ["Feature Usage Drop", selectedLead.feature_usage_drop],
                  ["Support Ticket Spike", selectedLead.support_ticket_spike],
                  ["Payment Delay", selectedLead.payment_delay],
                ].map(([label, active]) => (
                  <span key={label as string} style={{
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    background: active ? "rgba(239,68,68,0.1)" : "var(--surface2)",
                    color: active ? "#f87171" : "var(--muted)",
                    border: `1px solid ${active ? "rgba(239,68,68,0.25)" : "var(--border)"}`,
                  }}>{active ? "⚠ " : "✓ "}{label as string}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px" }}>
              <button
                onClick={() => toggleOverride(selectedLead.id, (overrides[selectedLead.id] as string) || selectedLead.churn_risk)}
                style={{
                  flex: 1,
                  background: "var(--accent)",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  padding: "9px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Override Risk → {["High", "Medium", "Low"][(["High", "Medium", "Low"].indexOf((overrides[selectedLead.id] as string) || selectedLead.churn_risk) + 1) % 3]}
              </button>
              <Link
                href={`/qbr?id=${selectedLead.id}`}
                style={{
                  flex: 1,
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  color: "var(--text)",
                  padding: "9px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none",
                  textAlign: "center",
                  display: "block"
                }}
              >
                Generate QBR →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
