import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, UploadCloud, Download, Trash2, Share2, Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AIChatService } from '../services/aiService';
import { ChatMessage, AIProviderId } from '../types/chat';

const CTA_GRADIENT = {
  background: "linear-gradient(to bottom, #2B2B2B, #101010)",
};

interface ChatInterfaceProps {
  extractedText: string;
  onRestart: () => void;
}

export default function ChatInterface({ extractedText, onRestart }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    type: 'bot',
    content: 'Hi! I\'m ready to answer questions about your PDF. What would you like to know?',
    id: 'welcome',
    timestamp: new Date().toISOString()
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiService] = useState(() => new AIChatService(extractedText));
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>('auto');
  const availableProviders = aiService.getAvailableProviders();

  const handleProviderChange = (newProvider: AIProviderId) => {
    setSelectedProvider(newProvider);
    aiService.setProvider(newProvider);
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  };

  const handleCopyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const exportChat = () => {
    const chatContent = messages
      .map(m => `${m.type.toUpperCase()} (${new Date(m.timestamp).toLocaleString()})\n${m.content}\n`)
      .join('\n---\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    setMessages([{
      type: 'bot',
      content: 'Chat history cleared. How can I help you?',
      id: 'reset',
      timestamp: new Date().toISOString()
    }]);
  };

  const shareChat = async () => {
    const shareText = messages.map(m => `${m.type}: ${m.content}`).join('\n\n');
    try {
      await navigator.share({
        title: 'AI PDF Chat Conversation',
        text: shareText
      });
    } catch (err) {
      console.error('Share failed:', err);
      handleCopyMessage(shareText, 'share');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: input.trim(),
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.sendMessage(userMessage.content);
      
      const botMessage: ChatMessage = {
        type: 'bot',
        content: response,
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: ChatMessage = {
        type: 'bot',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-black/70 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:px-6 border-b border-white/10 bg-white/[0.03] backdrop-blur-md">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10 shadow-inner">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">AI PDF Chat Assistant</h2>
              <p className="text-xs sm:text-sm text-white/60">Ask questions about your document</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <select
              value={selectedProvider}
              onChange={(e) => handleProviderChange(e.target.value as AIProviderId)}
              className="text-xs bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 rounded-full px-2.5 sm:px-3 py-1.5 focus:outline-none backdrop-blur-md cursor-pointer transition-all mr-1"
              title="Active AI Provider / Redundancy Mode"
            >
              {availableProviders.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                  {p.name} {p.available ? '' : '(no key)'}
                </option>
              ))}
            </select>
            <button
              onClick={exportChat}
              className="p-2 sm:p-2.5 text-white/70 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-full transition-all"
              title="Export chat"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={shareChat}
              className="p-2 sm:p-2.5 text-white/70 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-full transition-all"
              title="Share chat"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={clearChat}
              className="p-2 sm:p-2.5 text-white/70 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-full transition-all"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white rounded-full transition-opacity hover:opacity-90 ml-1 border border-white/15 shadow-md"
              style={CTA_GRADIENT}
            >
              <UploadCloud className="w-4 h-4" />
              <span>New PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar relative bg-transparent"
        onScroll={handleScroll}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 chat-message ${
              message.type === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 p-2 rounded-full border shadow-md ${
                message.type === 'user' 
                  ? 'bg-white/20 border-white/25 text-white' 
                  : 'bg-white/10 border-white/15 text-white'
              }`}
            >
              {message.type === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 max-w-[85%] sm:max-w-[80%] group">
              <div
                className={`p-4 sm:p-5 rounded-2xl relative shadow-lg ${
                  message.type === 'user'
                    ? 'bg-white/15 backdrop-blur-md text-white border border-white/20 ml-auto'
                    : 'bg-white/[0.05] backdrop-blur-md text-white/95 border border-white/10'
                }`}
              >
                <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
                <button
                  onClick={() => handleCopyMessage(message.content, message.id)}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all ${
                    copiedId === message.id ? 'text-emerald-400' : 'text-white/70 hover:text-white'
                  }`}
                  aria-label={copiedId === message.id ? "Copied!" : "Copy message"}
                >
                  {copiedId === message.id ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div
                className={`text-[11px] text-white/40 mt-1.5 px-1 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-white/10 border border-white/15 text-white shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-white/[0.05] backdrop-blur-md rounded-2xl border border-white/10">
              <div className="typing-indicator flex gap-1.5">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 p-3 bg-black/80 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl text-white/80 hover:text-white transition-all hover:scale-105"
            aria-label="Scroll to bottom"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 sm:p-5 border-t border-white/10 bg-black/70 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight(e);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your PDF..."
            className="w-full p-4 pr-14 bg-white/[0.06] border border-white/15 focus:border-white/35 rounded-2xl text-white placeholder-white/40 focus:outline-none transition-all resize-none max-h-[200px] overflow-y-hidden text-sm sm:text-base leading-relaxed"
            maxLength={2000}
            style={{ minHeight: '54px' }}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed border border-white/15 shadow-md"
            style={CTA_GRADIENT}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 text-xs text-white/40 flex justify-between px-2">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span>{input.length} / 2000</span>
        </div>
      </div>
    </div>
  );
}
