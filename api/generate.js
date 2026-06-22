export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { company, product, contract, renewal, wins, usage, risks, expansion } = req.body;

  const prompt = `You are a senior Customer Success Manager preparing a Quarterly Business Review document. Generate a professional, concise QBR brief using the following account information:

Company: ${company}
Product: ${product}
Contract Value: ${contract}
Renewal Date: ${renewal}
Key Wins This Quarter: ${wins}
Usage & Adoption: ${usage}
Open Risks: ${risks}
Expansion Opportunities: ${expansion}

Format the QBR with these sections exactly as shown (each section header in ALL CAPS followed by a blank line, then content):

EXECUTIVE SUMMARY

VALUE DELIVERED THIS QUARTER

PRODUCT ADOPTION & USAGE

RISKS & MITIGATION PLAN

EXPANSION OPPORTUNITIES

RECOMMENDED NEXT STEPS

Keep each section concise (3-5 sentences). Use professional, outcome-focused language. Do not use bullet points — write in clear prose. Total length: 350-450 words.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    return res.status(200).json({ qbr: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: 'API call failed', detail: err.message });
  }
}
