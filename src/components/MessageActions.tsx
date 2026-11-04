import React from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';

interface MessageActionsProps {
  content: string;
  id: string;
  copiedId: string | null;
  onCopy: (content: string, id: string) => void;
  onFeedback: (id: string, type: 'like' | 'dislike') => void;
}

export default function MessageActions({ content, id, copiedId, onCopy, onFeedback }: MessageActionsProps) {
  return (
    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={() => onFeedback(id, 'like')}
        className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all"
        title="Helpful response"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onFeedback(id, 'dislike')}
        className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all"
        title="Not helpful"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onCopy(content, id)}
        className={`p-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 backdrop-blur-md transition-all ${
          copiedId === id ? 'text-emerald-400' : 'text-white/70 hover:text-white'
        }`}
        title={copiedId === id ? "Copied!" : "Copy message"}
      >
        {copiedId === id ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
