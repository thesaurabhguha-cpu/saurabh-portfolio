export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { customerText, contractVal, daysToRenewal } = req.body;

  const prompt = `You are a Customer Success Manager analysing a customer communication for churn risk signals.

Customer communication:
"""
${customerText}
"""

${contractVal ? `Account contract value: ${contractVal}` : ''}
${daysToRenewal ? `Days until renewal: ${daysToRenewal}` : ''}

Analyse this communication and respond ONLY with valid JSON in this exact format (no other text, no markdown fences):
{
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "sentiment": "Positive" | "Neutral" | "Frustrated" | "Hostile",
  "signals": ["signal 1", "signal 2", "signal 3"],
  "draftResponse": "A professional 3-4 sentence CSM response that acknowledges the concern, provides reassurance, and proposes a concrete next step."
}

The signals array should contain 2-4 specific phrases or patterns from the communication that indicate risk. Be precise — quote or paraphrase directly from the text.`;

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
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const rawText = data.content[0].text.trim();

    let parsed;
    try {
      // Strip markdown fences if present
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      parsed = {
        riskLevel: 'Medium',
        sentiment: 'Neutral',
        signals: ['Could not parse signals from this communication.'],
        draftResponse: 'Thank you for reaching out. I would like to schedule a call to discuss your concerns in more detail and find the best path forward together.'
      };
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: 'API call failed', detail: err.message });
  }
}
