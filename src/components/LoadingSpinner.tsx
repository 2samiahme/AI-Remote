import React from 'react';
import { FileText } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 max-w-md mx-auto my-12 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-2xl text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 border-2 border-white/15 border-t-white rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <FileText className="w-7 h-7 text-white/90" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white tracking-tight mb-2">Processing your PDF</h3>
        <p className="text-white/60 text-sm">This may take a moment...</p>
      </div>
    </div>
  );
}
