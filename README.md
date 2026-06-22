# Saurabh Guha — CSM + AI Portfolio

Three live tools demonstrating AI-native Customer Success workflows.

## Projects

| Tool | What it does |
|---|---|
| **AccountPulse** | Account health scoring + AI CSM action recommendation |
| **QBR Pilot** | AI-generated Quarterly Business Review brief |
| **ChurnSignal** | Churn risk detection + draft CSM response from customer text |

## Stack

- HTML + CSS + Vanilla JS (no build step, no framework)
- Vercel Serverless Functions (Node.js) for API calls
- Claude API (`claude-sonnet-4-6`) — Anthropic

---

## Deployment to Vercel (one-time setup)

### Prerequisites
- Node.js installed
- Vercel account (free tier): https://vercel.com
- Anthropic API key: https://console.anthropic.com

### Step 1 — Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2 — Login
```bash
vercel login
```

### Step 3 — Deploy from this folder
```bash
cd saurabh-csm-portfolio
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name: `saurabh-csm-portfolio` (or anything you want)
- Directory: `.` (current directory)
- Override settings? **N**

### Step 4 — Add your API key as environment variable

In Vercel dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (your key)
   - Environment: Production + Preview + Development

### Step 5 — Redeploy to apply env var
```bash
vercel --prod
```

### Step 6 — Verify
Visit your Vercel URL and test each tool. All three should call the Claude API and return results.

---

## Local development

```bash
# Install Vercel CLI if not done
npm install -g vercel

# Create local env file
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env.local

# Run local dev server
vercel dev
```

Local dev runs at `http://localhost:3000`

---

## File structure

```
saurabh-csm-portfolio/
├── index.html                         ← Portfolio home
├── vercel.json                        ← Routing config
├── api/
│   ├── score.js                       ← AccountPulse API
│   ├── generate.js                    ← QBR Pilot API
│   └── analyze.js                     ← ChurnSignal API
├── project-1-healthscore/
│   └── index.html
├── project-2-qbr/
│   └── index.html
└── project-3-churnsignal/
    └── index.html
```

---

## After deploying — update these

1. **CV**: Add portfolio URL next to email in header
2. **LinkedIn Featured**: Add URL with caption: *"3 live AI tools — health scoring, QBR generation, churn detection"*
3. **LinkedIn About**: Add line: *"See my live AI tools: [url]"*
4. **Resume `index.html`**: Update the placeholder URLs for each project card

---

## Common issues

**CORS error** → Vercel functions and frontend are on the same domain, this shouldn't happen. If it does, test with `vercel dev` locally first.

**401 from Claude API** → ANTHROPIC_API_KEY is missing or wrong. Check Settings → Environment Variables → redeploy.

**Function returns empty** → Check Vercel function logs: Dashboard → Your project → Functions tab.

**Blank page on project routes** → Verify vercel.json is at the root and the rewrites are correct. Run `vercel dev` locally to debug.
