# 🚀 AI Powered Interview Assistant

A **Vite + React + Redux** web app that simulates a timed technical interview.  
It parses a candidate’s resume, generates tailored questions with **Google Gemini**, times and records answers, **auto-scores** each response, and produces a final **AI summary & recommendation**.



> **Stack:** React, Redux Toolkit, Ant Design, Vite, (optional Tailwind classes for gradients), Google Gemini API.

---

## ✨ Features

- **Resume-driven questions** (6 total: 2 Easy, 2 Medium, 2 Hard)
- **Per-question timers** (auto-submit on timeout)
- **Auto scoring** using Gemini (0–15 with sub-rubrics)
- **Final AI summary & recommendation**
- **Session persistence** (Redux + Persist)
- **Cross-tab sync** (keep UI state consistent across tabs)
- **Robust Gemini error handling** (targeted retries for `429/503` + safe fallbacks)
- **Dark UI theme** with subtle neon accents (fully customizable in `App.css`)
- **Deploy ready** (Vercel / Netlify guides included)

---

## 🔐 Environment Variables

This project uses **Vite**. All variables **must** be prefixed with `VITE_`.

### Setup

1. Copy the example file:

```bash
cp .env.example .env
```

2. Open `.env` and add your Gemini API key:

```bash
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

> ⚠️ Frontend-only apps **expose** API keys to users. For production, consider proxying Gemini calls through a small server (or Vercel/Netlify serverless function) to keep the key private and enforce your own rate limits.

---

## 🧑‍💻 Local Development

```bash
# 1) Clone the repository
git clone https://github.com/Sarg3n7/AI-Powered-Interview-Assitant.git

# 2) Install deps
npm install

# 3) Copy .env.example → .env and add your key
cp .env.example .env

# 4) Run dev server
npm run dev

# 5) Build / Preview
npm run build
npm run preview
```

- Vite serves at `http://localhost:5173` by default.

---

## 🧠 How AI Calls Work

All Gemini interactions live in **`src/services/geminiService.js`**:

- `generateQuestions(resumeText, candidateName)`  
  Returns exactly 6 questions (with difficulty & time limit). If parsing fails, it falls back to deterministic, sensible defaults.

- `scoreAnswer(question, answer)`  
  Requests a **JSON** payload with a total score (0–15) and sub-scores: `correctness (0–5)`, `completeness (0–3)`, `clarity (0–2)`, `problemSolving (0–3)`, `codeQuality (0–2)`. Safe parsing with a fallback heuristic if needed.

- `createSummary(candidateData, sessionData)`  
  Builds a final professional summary + recommendation + strengths + improvements. Again, safe parsing + fallback.

### Targeted Retries

`safeGenerate(prompt, context)` wraps Gemini calls and:

- Retries on **429 (rate limit)** and **503 (service unavailable)**
- Parses server-provided `"retryDelay"` or `"Please retry in Xs"` when available
- Uses capped exponential backoff with jitter otherwise
- Logs clean, helpful console messages

This is why you might still **see 429/503 in the console** occasionally—it’s normal and handled automatically. UI remains smooth.

---

## 🧭 UI Notes

- The top bar, tabs, cards, and chat follow a **dark theme** with neon accents.  
- Scrollbars and overflow behavior in **`InterviewChat.jsx`** are tuned so the **question block** and **message list** each have their own scroll containers (ChatGPT-like), preventing layout jumps when alerts appear.

You can tweak colors in **`App.css`**.

---

## 🧪 Scripts

```jsonc
// package.json (relevant bits)
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b || true && vite build",   // tsc is optional; ignore if not using TS
    "preview": "vite preview"
  }
}
```

---

## ☁️ Deploy

### Option A — Vercel (recommended for Vite)

1. Push your repo to GitHub.
2. Import to Vercel → Project Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add **Environment Variable**:
   - `VITE_GEMINI_API_KEY` → your key (apply to **Production** & **Preview**)
4. Deploy.

### Option B — Netlify

**Site Settings → Build & deploy → Build settings**

- **Base directory:** `.` (or your subfolder)
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variables:** `VITE_GEMINI_API_KEY`
- Click **Deploy site**.

---

## 🛟 Troubleshooting

**I see 429/503 in console logs.**  
That’s normal under load. The app retries with backoff. If it persists:
- Ensure your **Gemini quota** is sufficient.
- Reduce parallel requests (one question at a time already helps).
- Consider a backend proxy to centralize rate-limiting.

**“Missing Gemini API key” error.**  
Set `VITE_GEMINI_API_KEY` in your `.env` (local) or in **Vercel/Netlify project settings** (cloud). Rebuild after setting.

**White screen after deploy**  
- Confirm **Output Directory** is `dist`.  
- Don’t set CRA-style `homepage` in `package.json`.  
- Check the browser console for missing env var.

**Selectors warnings (React-Redux)**  
If you see “selector returned a different result” in dev tools, memoize selectors using `createSelector` or return stable references.

---

## 📄 License

MIT © Sarg3n7
