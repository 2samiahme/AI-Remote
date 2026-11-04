import React, { useState } from 'react';
import { BookOpen, Upload, Shield, Bot } from 'lucide-react';
import FileUpload from './components/FileUpload';
import LoadingSpinner from './components/LoadingSpinner';
import ChatInterface from './components/ChatInterface';
import { Toaster } from 'react-hot-toast';
import ChromeAINotification from './components/ChromeAINotification';
import { AIChatService } from './services/aiService';
import { extractTextFromPdf } from './services/pdfService';

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260803_192301_9231ed6b-c55c-4a48-909c-4ebe11cf2e11.mp4";

const CTA_GRADIENT = {
  background: "linear-gradient(to bottom, #2B2B2B, #101010)",
};

const LOGO_PATH =
  "M 128 128 C 128 198.692 70.692 256 0 256 C 0 185.308 57.308 128 128 128 Z M 128 128 C 198.692 128 256 185.308 256 256 C 185.308 256 128 198.692 128 128 Z M 0 0 C 70.692 0 128 57.308 128 128 C 57.308 128 0 70.692 0 0 Z M 256 0 C 256 70.692 198.692 128 128 128 C 128 57.308 185.308 0 256 0 Z";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width="24"
        height="24"
        viewBox="0 0 256 256"
        className="h-6 w-6 fill-white"
        aria-hidden="true"
      >
        <path d={LOGO_PATH} />
      </svg>
      <span className="text-base sm:text-lg font-semibold tracking-tight text-white">
        AI PDF Chat Assistant
      </span>
    </div>
  );
}

function App() {
  const [, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [aiInitialized, setAiInitialized] = useState(false);

  const handleUpload = async (selectedFile: File) => {
    console.log('Starting file upload:', selectedFile.name);
    setLoading(true);
    setError('');
    setAiInitialized(false);

    try {
      console.log('Extracting text from PDF...');
      const text = await extractTextFromPdf(selectedFile);
      setExtractedText(text);
      console.log('Text extraction successful');

      // Initialize AI service and wait for it
      const aiService = new AIChatService(text);
      await aiService.waitForInitialization();
      setAiInitialized(true);
      
    } catch (err: unknown) {
      console.error('Upload Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to extract text from PDF';
      setError(errorMessage);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    try {
      setFile(selectedFile);
      handleUpload(selectedFile);
    } catch (err: unknown) {
      console.error('File Selection Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to select file';
      setError(errorMessage);
    }
  };

  const handleRestart = () => {
    console.log('Restarting chat...');
    setFile(null);
    setExtractedText('');
    setError('');
    setAiInitialized(false);
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white/20 selection:text-white flex flex-col">
      {/* Background Cinematic Video from Template */}
      <video
        className="fixed inset-0 h-full w-full object-cover z-0 pointer-events-none"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/background.mp4" type="video/mp4" />
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/50 z-[1] pointer-events-none" />

      <Toaster />
      <ChromeAINotification />

      {/* Navigation Bar in Template Style */}
      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-12 bg-transparent">
        <Logo />

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 backdrop-blur-lg border border-white/10">
            <span className="rounded-full px-3 py-1 text-xs font-medium text-white/80">
              {(() => {
                const active = [];
                if (import.meta.env.VITE_GROK_API_KEY) active.push('Grok');
                if (import.meta.env.VITE_OPENAI_API_KEY) active.push('OpenAI');
                if (import.meta.env.VITE_ANTHROPIC_API_KEY) active.push('Claude');
                if (import.meta.env.VITE_GEMINI_API_KEY) active.push('Gemini');
                if (active.length > 1) return `Redundant Multi-AI (${active.join(' + ')})`;
                if (active.length === 1) return `Powered by ${active[0]}`;
                return 'On-Device Gemini Nano';
              })()}
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-medium text-white/80">
              Auto Failover
            </span>
          </div>
          {!extractedText && !loading && (
            <a
              href="#upload"
              className="flex items-center self-stretch rounded-full px-5 py-2 text-xs sm:text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-lg border border-white/15"
              style={CTA_GRADIENT}
            >
              Get started
            </a>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow p-4 sm:p-6 md:p-10 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          {!extractedText && !loading && (
            <div className="space-y-12 sm:space-y-16">
              {/* Hero Section */}
              <div className="text-center space-y-6 pt-4 sm:pt-8 max-w-4xl mx-auto">
                <div className="inline-flex items-center justify-center">
                  <div className="p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/15 shadow-2xl transition-transform hover:scale-105 duration-300">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
                    AI PDF Chat Assistant
                  </h1>
                  <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                    Transform your PDF documents into interactive conversations. Upload your file and start asking questions to get instant, intelligent responses.
                  </p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <FileUpload onFileSelect={handleFileSelect} error={error} />

              {/* 3 Feature Cards in Template Article Layout */}
              <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto px-2">
                <article className="rounded-2xl bg-white/10 p-6 backdrop-blur-lg border border-white/10 shadow-xl transition-all duration-300 hover:bg-white/15 hover:border-white/20 flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 w-fit mb-4 text-white">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl text-white font-semibold tracking-tight mb-2">Easy Upload</h3>
                    <p className="text-sm leading-relaxed text-white/70">
                      Simply drag and drop your PDF file or click to browse. Supports files up to 2MB in size.
                    </p>
                  </div>
                </article>

                <article className="rounded-2xl bg-white/10 p-6 backdrop-blur-lg border border-white/10 shadow-xl transition-all duration-300 hover:bg-white/15 hover:border-white/20 flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 w-fit mb-4 text-white">
                      <Bot className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl text-white font-semibold tracking-tight mb-2">Smart Analysis</h3>
                    <p className="text-sm leading-relaxed text-white/70">
                      Our AI assistant analyzes your PDF content and provides intelligent, context-aware responses.
                    </p>
                  </div>
                </article>

                <article className="rounded-2xl bg-white/10 p-6 backdrop-blur-lg border border-white/10 shadow-xl transition-all duration-300 hover:bg-white/15 hover:border-white/20 flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 w-fit mb-4 text-white">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl text-white font-semibold tracking-tight mb-2">Secure & Private</h3>
                    <p className="text-sm leading-relaxed text-white/70">
                      Your documents are processed securely and not stored on our servers after analysis.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          )}

          {loading && <LoadingSpinner />}

          {extractedText && !loading && aiInitialized && (
            <ChatInterface extractedText={extractedText} onRestart={handleRestart} />
          )}
        </div>
      </main>

      {/* Footer in Template Style */}
      {!extractedText && !loading && (
        <footer className="relative z-20 border-t border-white/10 bg-black/50 backdrop-blur-xl py-6 mt-12">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-white/60 text-xs sm:text-sm">
              AI PDF Chat Assistant &bull; Private, client-side on-device AI document analysis
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
