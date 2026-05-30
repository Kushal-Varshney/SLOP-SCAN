# SLOP SCAN 🔬

> **The internet has a quality problem. Slop Scan is the solution.**

**Slop Scan** is a powerful, privacy-first AI-generated content detection engine. Unlike traditional AI detectors that rely on expensive, slow, and privacy-invasive external LLM APIs, Slop Scan operates entirely locally. It uses pure linguistic analysis, statistical fingerprinting, and structural pattern matching to expose hollow, low-quality AI-generated text ("slop").

---

## 🌟 Key Features

- **Zero External APIs:** 100% of the analysis happens locally on the machine. Your data is never sent to OpenAI, Anthropic, or any third-party server. Privacy is guaranteed.
- **8 Domain-Specific Tracks:** Generic AI detectors fail because a PR description looks different than a blog post. Slop Scan features 8 specialized tracks:
  - `Code & PRs`: Detects hollow commit messages and rubber-stamp code reviews.
  - `Docs & KBs`: Catches circular, filler-heavy documentation.
  - `Hiring`: Exposes generated cover letters and take-home assignments.
  - `Communications`: Filters out inflated, AI-expanded workplace messages.
  - `SEO & Content`: Fingerprints listicle repetitions and content farm structures.
  - `Academia`: Protects scholarly integrity against stylistic inconsistencies.
  - `Marketplaces`: Scores review authenticity and sentiment uniformity.
  - `Social & News`: Detects synthetic text and engagement bait.
- **Visual Sentence Heatmap:** Instantly see exactly *which* sentences trigger the AI detection through a color-coded visual heatmap.
- **Live Fire Batch Scanning:** Paste a massive chunk of text, and Slop Scan will automatically split it into logical chunks, analyze them concurrently, and detect self-similarity/repetition across the chunks.
- **Enterprise SaaS Dashboard:** Features a beautiful, interactive "Soft Slate" UI with mock authentication, user history, and real-time scanning gauges.
- **Transparency Benchmarks:** Includes a built-in evaluation suite that runs the engine against known datasets to generate a live Confusion Matrix, proving its accuracy in real-time.

---

## ⚙️ How It Works (The Engine)

Slop Scan uses a composite scoring system built on 5 core pillars:

1. **Linguistic Analysis:** Calculates Type-Token Ratio (TTR), Hapax Legomena Ratio, and multiple readability indexes (Flesch-Kincaid, Gunning Fog).
2. **Statistical Fingerprinting:** Measures Shannon Entropy on word frequencies and evaluates sentence length "burstiness" (AI tends to have uniform sentence lengths, while humans are bursty).
3. **Structural Pattern Matching:** Scans for overused AI vocabulary, hedging density, repetitive sentence openers, and em-dash abuse.
4. **Information Density:** Measures the ratio of actual facts (named entities, numbers) vs. empty filler sentences.
5. **Similarity Detection:** Uses TF-IDF and cosine similarity to detect documents that are unnaturally self-similar (a common hallmark of AI generation).

---

## 🚀 Setup & Installation

1. **Clone the repository** and navigate to the project folder.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser. 
5. *Demo Note:* The application features a simulated authentication wall. Click **Sign Up**, enter any User ID and Password, and click Create Account to access the dashboard.

---

## 📈 Efficacy & Performance

**How good is it?** 
Because Slop Scan relies on statistical anomalies rather than trying to "guess" the next token, it is exceptionally robust against basic prompting tricks. 
- **Zero Latency:** Because there are no API calls, analysis happens in milliseconds.
- **High Recall:** The engine excels at identifying the "average" ChatGPT output due to the AI's tendency to normalize entropy and use highly predictable vocabulary.
- **Complete Transparency:** Unlike black-box detectors (like GPTZero), Slop Scan tells you *exactly* why a text was flagged (e.g., "Low burstiness", "High filler ratio", "Excessive AI vocabulary").

---

## 🔮 Future Scope & Expansion

Slop Scan is built with a highly modular architecture, making it ready for massive enterprise expansion:

1. **CI/CD Pipeline Integration (GitHub Actions):** 
   - The engine can easily be wrapped into a GitHub Action that automatically scans Pull Request descriptions and throws a warning if a developer submitted an AI-generated, hollow PR summary instead of explaining their actual code decisions.
2. **Browser Extension:** 
   - A Chrome/Firefox extension version of the analyzer that allows hiring managers to scan LinkedIn profiles or cover letters directly in the browser without copy-pasting.
3. **Enterprise API & Webhooks:**
   - The `/api/analyze` route is already built. This can be exposed as a monetized SaaS API for platforms (like Reddit, Upwork, or Medium) to auto-moderate incoming content.
4. **Custom Threshold Tuning:**
   - In the future, enterprise admins could tune the weights of the 5 core analyzers. For example, a legal firm might turn down the "Information Density" penalty, while a marketing firm might crank up the "SEO Filler" penalty.
5. **Self-Hosted Deployment:**
   - Because it has zero external dependencies and runs purely on Node.js/V8, companies with strict data compliance (HIPAA, SOC2) can deploy Slop Scan entirely on-premise without risking data leaks.

---
*Built with Next.js, React, and pure mathematical analysis.*
