import React from 'react';
import { FileUp, AlertCircle, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  error?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export default function FileUpload({ onFileSelect, error }: FileUploadProps) {
  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Please upload a PDF file only';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div id="upload" className="w-full max-w-2xl mx-auto">
      <div className="rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl transition-all">
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 bg-white/10 rounded-2xl mb-3 border border-white/10 backdrop-blur-md shadow-inner">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-1.5">
            Upload your PDF
          </h2>
          <p className="text-sm text-white/60">
            Drag and drop your file here or click to browse
          </p>
        </div>

        <label
          className="relative flex flex-col items-center justify-center w-full h-64 sm:h-72 border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.06] backdrop-blur-md transition-all duration-300 group"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="p-4 bg-white/10 group-hover:bg-white/15 rounded-2xl mb-4 border border-white/10 transition-transform duration-300 group-hover:scale-110 shadow-lg text-white">
              <FileUp className="w-8 h-8" />
            </div>
            <p className="mb-2 text-sm text-white/80">
              <span className="font-semibold text-white">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-white/50">PDF files only (max 2MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileSelect(file);
              }
            }}
          />
        </label>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/sample-document.pdf');
                const blob = await res.blob();
                const sampleFile = new File([blob], 'sample-document.pdf', { type: 'application/pdf' });
                onFileSelect(sampleFile);
              } catch (err) {
                console.error('Failed to load sample PDF', err);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition-all shadow-sm"
          >
            No PDF on hand? Click to load sample document
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3 text-red-300 backdrop-blur-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
