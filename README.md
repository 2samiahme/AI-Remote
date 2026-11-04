# AI-Remote - AI PDF Chat Assistant

Transform any PDF document into an interactive, natural conversation. Built with modern web technologies, multi-provider redundancy (Grok AI, OpenAI, Anthropic, Google Gemini, Chrome on-device Gemini Nano), and 100% private client-side processing.

## What is it?

AI PDF Chat Assistant transforms any PDF document into an interactive, natural conversation. Built with modern web technologies and on-device AI capabilities, it lets you ask questions and gain insights from your documents instantly.

## Key Features

### 📄 Client-Side PDF Processing
- Drag and drop any PDF document directly into the browser.
- 100% private and on-device text parsing using PDF.js.
- Your documents are processed entirely in the browser and never uploaded to third-party servers.

### ⚡ Multi-Provider Redundancy & Intelligent Failover
- **Grok AI (xAI)**: Ultra-fast document comprehension and conversational reasoning.
- **OpenAI (GPT-4o)**: Deep analytical comprehension and summarization.
- **Anthropic (Claude 3.5 Sonnet)**: Nuanced document QA with direct browser connectivity.
- **Google Gemini**: Scalable multimodal capabilities.
- **Chrome On-Device AI**: Local on-device Gemini Nano when running in supported Chromium browsers.
- **Local Fallback**: Instant offline simulated parsing ensuring zero downtime.

### 💬 Smart Conversations
- Ask questions in plain English and receive context-aware answers.
- Preserves conversation history for follow-up questions.
- Markdown and syntax-highlighted code rendering.

### 🛠️ Productivity Tools
- One-click copy for responses and code snippets.
- Export chat conversations to text.
- Clean, responsive glassmorphic dark-mode interface.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (optional):
   Copy `.env.example` to `.env` and add any of your API keys:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
```

The output files will be in the `dist/` directory.

### Linting

```bash
npm run lint
```

## License

MIT
