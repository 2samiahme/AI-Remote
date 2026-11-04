import { AIProviderId } from '../types/chat';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SendMessageResult {
  reply: string;
  provider: string;
  isFailover: boolean;
  errorLog?: string[];
}

interface AILanguageModel {
  prompt: (text: string) => Promise<string>;
}

export class AIChatService {
  private extractedText: string;
  private messages: Message[] = [];
  private chromeSession: AILanguageModel | null = null;
  private selectedProvider: AIProviderId = 'auto';

  constructor(extractedText: string) {
    this.extractedText = extractedText;
    console.log('AIChatService initialized with text length:', extractedText.length);
    this.initChromeAI();
  }

  async waitForInitialization(): Promise<void> {
    // Non-blocking initialization
    return Promise.resolve();
  }

  setProvider(providerId: AIProviderId) {
    this.selectedProvider = providerId;
  }

  getProvider(): AIProviderId {
    return this.selectedProvider;
  }

  private async initChromeAI() {
    try {
      const aiGlobal =
        (typeof window !== 'undefined' && (window as unknown as { ai?: { languageModel?: { create: (cfg: { systemPrompt: string }) => Promise<AILanguageModel> } } }).ai) ||
        (typeof globalThis !== 'undefined' && (globalThis as unknown as { ai?: { languageModel?: { create: (cfg: { systemPrompt: string }) => Promise<AILanguageModel> } } }).ai);

      if (aiGlobal?.languageModel?.create) {
        this.chromeSession = await aiGlobal.languageModel.create({
          systemPrompt: `You are an AI assistant analyzing a PDF document. Answer accurately based on the document content:\n\n${this.extractedText}`,
        });
        console.log('Chrome Built-in AI initialized');
      }
    } catch (e) {
      console.warn('Chrome AI not available:', e);
    }
  }

  getAvailableProviders(): { id: AIProviderId; name: string; available: boolean }[] {
    const grokKey = (import.meta.env.VITE_GROK_API_KEY || '').trim();
    const openaiKey = (import.meta.env.VITE_OPENAI_API_KEY || '').trim();
    const anthropicKey = (import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim();
    const geminiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
    const chromeAvailable = Boolean(this.chromeSession);

    return [
      { id: 'auto', name: 'Auto Failover (All Available)', available: true },
      { id: 'grok', name: 'Grok AI (xAI)', available: Boolean(grokKey) },
      { id: 'openai', name: 'OpenAI (GPT-4o)', available: Boolean(openaiKey) },
      { id: 'anthropic', name: 'Anthropic (Claude 3.5)', available: Boolean(anthropicKey) },
      { id: 'gemini', name: 'Google Gemini', available: Boolean(geminiKey) },
      { id: 'chrome', name: 'Chrome On-Device (Gemini Nano)', available: chromeAvailable },
    ];
  }

  async sendMessage(userMessage: string): Promise<string> {
    const currentMessages: Message[] = [...this.messages, { role: 'user', content: userMessage }];
    const errors: string[] = [];

    // Build priority list of providers based on selection & keys available
    const sequence = this.getExecutionSequence();
    console.log('[AIChatService] Planned provider failover sequence:', sequence);

    for (let i = 0; i < sequence.length; i++) {
      const providerId = sequence[i];
      try {
        console.log(`[AIChatService] Attempting provider [${providerId}]...`);
        let reply = '';
        let providerName = '';

        switch (providerId) {
          case 'grok':
            reply = await this.callGrok(userMessage, currentMessages);
            providerName = 'Grok AI';
            break;
          case 'openai':
            reply = await this.callOpenAI(userMessage, currentMessages);
            providerName = 'OpenAI';
            break;
          case 'anthropic':
            reply = await this.callAnthropic(userMessage, currentMessages);
            providerName = 'Anthropic Claude';
            break;
          case 'gemini':
            reply = await this.callGemini(userMessage, currentMessages);
            providerName = 'Google Gemini';
            break;
          case 'chrome':
            reply = await this.callChromeAI(userMessage);
            providerName = 'Chrome On-Device';
            break;
          case 'simulation':
          default:
            reply = this.callSimulation(userMessage);
            providerName = 'Simulated Local Fallback';
            break;
        }

        if (reply && reply.trim()) {
          // If failover occurred, prepend a subtle note
          let finalReply = reply;
          if (i > 0 && errors.length > 0) {
            const failedNames = errors.map((e) => e.split(':')[0]).join(', ');
            finalReply = `> ⚡ *Redundancy Failover: Answered by ${providerName} (${failedNames} unavailable)*\n\n${reply}`;
          }

          this.messages = [...currentMessages, { role: 'assistant', content: finalReply }];
          return finalReply;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn(`[AIChatService] Provider [${providerId}] failed:`, errorMsg);
        errors.push(`${providerId}: ${errorMsg}`);
        // Continue loop to try next provider in sequence
      }
    }

    // If every single provider in the sequence failed, fallback to simulation
    const simulationReply = this.callSimulation(userMessage);
    const failureSummary = errors.length > 0 ? `(All configured providers encountered errors: ${errors.join('; ')})` : '';
    const finalFallback = `> ℹ️ *Simulation Mode: ${failureSummary}*\n\n${simulationReply}`;
    this.messages = [...currentMessages, { role: 'assistant', content: finalFallback }];
    return finalFallback;
  }

  private getExecutionSequence(): AIProviderId[] {
    const list: AIProviderId[] = [];
    const grokKey = (import.meta.env.VITE_GROK_API_KEY || '').trim();
    const openaiKey = (import.meta.env.VITE_OPENAI_API_KEY || '').trim();
    const anthropicKey = (import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim();
    const geminiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

    if (this.selectedProvider !== 'auto') {
      list.push(this.selectedProvider);
    }

    // Redundant order
    if (grokKey && !list.includes('grok')) list.push('grok');
    if (openaiKey && !list.includes('openai')) list.push('openai');
    if (anthropicKey && !list.includes('anthropic')) list.push('anthropic');
    if (geminiKey && !list.includes('gemini')) list.push('gemini');
    if (this.chromeSession && !list.includes('chrome')) list.push('chrome');

    // Always keep simulation at the end as ultimate safety net
    list.push('simulation');
    return list;
  }

  // --- 1. Grok AI (xAI) ---
  private async callGrok(userMessage: string, messages: Message[]): Promise<string> {
    const apiKey = (import.meta.env.VITE_GROK_API_KEY || '').trim();
    if (!apiKey) throw new Error('Missing VITE_GROK_API_KEY');

    const url = import.meta.env.VITE_GROK_API_URL || '/api/proxy/grok/chat/completions';
    const model = import.meta.env.VITE_GROK_MODEL || 'grok-beta';

    const payload = {
      model,
      messages: [
        {
          role: 'system',
          content: `You are an intelligent PDF AI Assistant. Answer clearly and accurately based strictly on this document:\n\n--- DOCUMENT CONTENT ---\n${this.extractedText}\n--- END OF CONTENT ---`,
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.2,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || data.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data.choices?.[0]?.message?.content || '';
  }

  // --- 2. OpenAI ---
  private async callOpenAI(userMessage: string, messages: Message[]): Promise<string> {
    const apiKey = (import.meta.env.VITE_OPENAI_API_KEY || '').trim();
    if (!apiKey) throw new Error('Missing VITE_OPENAI_API_KEY');

    const url = import.meta.env.VITE_OPENAI_API_URL || '/api/proxy/openai/chat/completions';
    const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

    const payload = {
      model,
      messages: [
        {
          role: 'system',
          content: `You are an intelligent PDF AI Assistant. Answer questions based on the following document content:\n\n${this.extractedText}`,
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.2,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data.choices?.[0]?.message?.content || '';
  }

  // --- 3. Anthropic (Claude) ---
  private async callAnthropic(userMessage: string, messages: Message[]): Promise<string> {
    const apiKey = (import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim();
    if (!apiKey) throw new Error('Missing VITE_ANTHROPIC_API_KEY');

    const url = import.meta.env.VITE_ANTHROPIC_API_URL || '/api/proxy/anthropic/messages';
    const model = import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

    // Anthropic messages format: role must alternate 'user' and 'assistant', system is top-level
    const anthropicMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const payload = {
      model,
      max_tokens: 1500,
      system: `You are an intelligent PDF AI Assistant. Answer clearly and accurately based strictly on this document:\n\n${this.extractedText}`,
      messages: anthropicMessages,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'dangerously-allow-browser': 'true',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data.content?.[0]?.text || '';
  }

  // --- 4. Google Gemini API ---
  private async callGemini(userMessage: string, messages: Message[]): Promise<string> {
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
    if (!apiKey) throw new Error('Missing VITE_GEMINI_API_KEY');

    const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = [
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ];

    const payload = {
      systemInstruction: {
        parts: [{ text: `You are an intelligent PDF AI Assistant. Answer based on this document content:\n\n${this.extractedText}` }],
      },
      contents,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // --- 5. Chrome Built-in AI ---
  private async callChromeAI(userMessage: string): Promise<string> {
    if (!this.chromeSession) {
      throw new Error('Chrome Built-in AI is not ready on this browser.');
    }
    return await this.chromeSession.prompt(userMessage);
  }

  // --- 6. Simulation Fallback ---
  private callSimulation(userMessage: string): string {
    const query = userMessage.toLowerCase().trim();
    const sentences = this.extractedText
      .split(/(?<=[.?!])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const queryWords = query.split(/\s+/).filter((w) => w.length > 3);
    const matches = sentences.filter((sentence) =>
      queryWords.some((word) => sentence.toLowerCase().includes(word))
    );

    let answerText = '';
    if (matches.length > 0) {
      answerText = matches.slice(0, 3).join(' ');
    } else {
      const summaryPreview = sentences.slice(0, 3).join(' ');
      answerText = `I couldn't find a direct match for "${userMessage}" in the document. Here is an excerpt from the document:\n\n> ${summaryPreview}`;
    }

    return answerText;
  }
}
