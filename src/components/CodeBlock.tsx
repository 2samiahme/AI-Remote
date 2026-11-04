import React from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface CodeBlockProps {
  language: string;
  value: string;
}

export default function CodeBlock({ language, value }: CodeBlockProps) {
  const highlighted = hljs.highlight(value, { language }).value;

  return (
    <div className="relative group my-3 rounded-2xl overflow-hidden border border-white/15 bg-black/80 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.04] text-xs text-white/50 font-mono">
        <span>{language || 'code'}</span>
        <button
          onClick={() => navigator.clipboard.writeText(value)}
          className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
          title="Copy code"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy</span>
        </button>
      </div>
      <pre className="!bg-transparent !p-4 overflow-x-auto text-sm">
        <code 
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
