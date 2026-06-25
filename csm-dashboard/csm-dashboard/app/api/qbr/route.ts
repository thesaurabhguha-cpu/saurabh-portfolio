import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { lead } = await req.json();

  if (!lead) {
    return NextResponse.json({ error: "No lead data provided" }, { status: 400 });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "NVIDIA_API_KEY not configured" }, { status: 500 });
  }

  const daysSinceLogin = Math.floor(
    (Date.now() - new Date(lead.last_login_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  const signals = [
    lead.login_frequency_drop && "login frequency has dropped",
    lead.feature_usage_drop && "feature usage has declined",
    lead.support_ticket_spike && "support ticket volume has spiked",
    lead.payment_delay && "a payment delay has been recorded",
  ].filter(Boolean).join("; ") || "no active risk signals";

  const prompt = `You are a senior Customer Success Manager preparing a Quarterly Business Review (QBR) for an executive stakeholder meeting.

Account Details:
- Company: ${lead.company}
- Contact: ${lead.name} (${lead.email})
- Industry: ${lead.industry}
- Plan: ${lead.plan}
- ARR: $${lead.arr.toLocaleString()}
- Health Score: ${lead.health_score}/100
- Churn Risk: ${lead.churn_risk}
- NPS Score: ${lead.nps_score}/10
- Last Login: ${lead.last_login_date} (${daysSinceLogin} days ago)
- Risk Signals: ${signals}

Generate a professional QBR outline with the following sections:

1. EXECUTIVE SUMMARY (2-3 sentences: account status, key metric, risk level)
2. ACCOUNT HEALTH SCORECARD (bullet list: health score, NPS, login trend, risk signals)
3. WINS THIS QUARTER (2-3 genuine positive points based on the data)
4. RISKS & CONCERNS (honest assessment based on signals and health score)
5. RECOMMENDED ACTIONS (3-4 specific, actionable next steps for the CSM)
6. EXPANSION OPPORTUNITIES (based on plan tier and health — where relevant)
7. NEXT STEPS & OWNER (bullet list with owner = CSM)

Keep it crisp, executive-ready, data-driven. No fluff. Use the actual numbers. Flag if this account needs urgent intervention.`;

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.3-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
        temperature: 0.4,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `NVIDIA API error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No response generated.";

    return NextResponse.json({ qbr: content });
  } catch (err) {
    return NextResponse.json({ error: `Request failed: ${err}` }, { status: 500 });
  }
}
