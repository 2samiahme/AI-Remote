export interface ChatSession {
  systemPrompt: string;
}

export type AIProviderId = 'auto' | 'grok' | 'openai' | 'anthropic' | 'gemini' | 'chrome' | 'simulation';

export interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  id: string;
  timestamp: string;
  provider?: string;
  isFailover?: boolean;
}
