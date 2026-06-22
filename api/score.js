export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { score, label, daysLogin, tickets, adoption, contractValue, daysRenewal } = req.body;

  const prompt = `You are a senior Customer Success Manager. An account has the following health profile:

- Health Score: ${score}/100 (${label})
- Days since last login: ${daysLogin}
- Open support tickets: ${tickets}
- Feature adoption rate: ${adoption}%
- Contract value: £${contractValue}
- Days until renewal: ${daysRenewal}

Write a 2-3 sentence recommended action for the CSM managing this account. Be specific, practical, and focused on the next 1-2 things the CSM should do this week. Write in second person ("You should..."). Keep it under 80 words.`;

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
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    return res.status(200).json({ recommendation: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: 'API call failed', detail: err.message });
  }
}
