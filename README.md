# Flurentra — AI English Coach

[![Live Demo](https://img.shields.io/badge/Live%20Demo-flurentra--8zli.vercel.app-6C5CE7?style=for-the-badge&logo=vercel&logoColor=white)](https://flurentra-8zli.vercel.app)

🌐 **Live Site:** [https://flurentra-8zli.vercel.app](https://flurentra-8zli.vercel.app)

An AI-powered English learning platform for Hindi-speaking users. Built with Next.js, Tailwind CSS, Framer Motion, and Google Gemini AI.

## Features

- 🎤 **Voice Input** — Speak your answers using the browser's Speech Recognition API
- 💬 **Conversational AI Test** — 3-question diagnostic chat evaluates your English level
- 🧠 **Gemini AI Analysis** — Strict evaluation of grammar, confidence score, weaknesses
- 📊 **Personalized Dashboard** — Daily learning plan tailored to your specific weaknesses
- ✏️ **AI Practice Studio** — Get instant corrections, improvements, and explanations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI**: Google Gemini 2.5 Flash
- **Voice**: Web Speech API (Chrome & Safari)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Samraatsharma/flurentra.git
cd flurentra
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free API key at [Google AI Studio](https://aistudio.google.com/apikey)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy on Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
3. Add your environment variable:
   - Key: `GEMINI_API_KEY`
   - Value: your Gemini API key
4. Click **Deploy**

> ⚠️ **Important**: Never commit `.env.local`. Always add `GEMINI_API_KEY` via the Vercel dashboard.
