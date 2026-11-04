interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AILanguageModel {
  prompt: (text: string) => Promise<string>;
}

export class AIChatService {
  private session: AILanguageModel | null = null;
  private messages: Message[] = [];
  private isSimulationMode = false;
  private extractedText = '';
  private initializationPromise: Promise<void>;

  constructor(extractedText: string) {
    this.extractedText = extractedText;
    console.log('Initializing AI Chat Service with extracted text length:', extractedText.length);
    this.initializationPromise = this.initializeSession(extractedText);
  }

  async waitForInitialization() {
    await this.initializationPromise;
  }

  private async initializeSession(extractedText: string) {
    try {
      // Check for Chrome's built-in AI Prompt API
      const aiGlobal =
        (typeof window !== 'undefined' && (window as unknown as { ai?: { languageModel?: { create: (cfg: { systemPrompt: string }) => Promise<AILanguageModel> } } }).ai) ||
        (typeof globalThis !== 'undefined' && (globalThis as unknown as { ai?: { languageModel?: { create: (cfg: { systemPrompt: string }) => Promise<AILanguageModel> } } }).ai);

      if (aiGlobal?.languageModel?.create) {
        console.log('Detected Chrome Built-in AI. Creating language model session...');
        this.session = await aiGlobal.languageModel.create({
          systemPrompt: `You are an AI PDF assistant. Your responses should only be based on the provided document content. Here is the document content:\n\n${extractedText}`,
        });
        console.log('Chrome AI session created successfully');
        this.isSimulationMode = false;
        return;
      }

      // If Chrome AI is not detected, enable graceful simulation mode for development/testing
      console.info('Chrome Built-in AI not detected. Falling back to local test simulation mode.');
      this.isSimulationMode = true;
    } catch (error) {
      console.warn('Failed to initialize Chrome AI session, using simulation mode:', error);
      this.isSimulationMode = true;
    }
  }

  async sendMessage(userMessage: string): Promise<string> {
    const currentMessages = [...this.messages, { role: 'user' as const, content: userMessage }];

    if (this.isSimulationMode) {
      // Small delay to simulate thinking time in UI
      await new Promise((resolve) => setTimeout(resolve, 600));
      const simulatedResponse = this.generateSimulatedResponse(userMessage);
      this.messages = [...currentMessages, { role: 'assistant', content: simulatedResponse }];
      return simulatedResponse;
    }

    if (!this.session) {
      throw new Error('AI session is not ready.');
    }

    try {
      console.log('Sending message to Chrome AI:', userMessage);
      const result = await this.session.prompt(userMessage);
      console.log('Chrome AI response received:', result);

      this.messages = [...currentMessages, { role: 'assistant', content: result }];
      return result;
    } catch (error) {
      console.error('Failed to get Chrome AI response:', error);
      throw error;
    }
  }

  private generateSimulatedResponse(userMessage: string): string {
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

    return `${answerText}\n\n> ℹ️ *Note: Running in simulation mode because Chrome's built-in AI (window.ai) was not detected in this browser. To use real on-device Gemini Nano, open this in Chrome Dev or Canary with Prompt API flags enabled.*`;
  }
}
