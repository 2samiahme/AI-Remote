import React, { useState } from 'react';
import { BookOpen, Upload, Shield, Bot } from 'lucide-react';
import FileUpload from './components/FileUpload';
import LoadingSpinner from './components/LoadingSpinner';
import ChatInterface from './components/ChatInterface';
import { Toaster } from 'react-hot-toast';
import ChromeAINotification from './components/ChromeAINotification';
import { AIChatService } from './services/aiService';
import { extractTextFromPdf } from './services/pdfService';

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
    <div>
      <Toaster />
      <ChromeAINotification />
      <div className="min-h-screen bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 flex flex-col">
        <main className="flex-grow p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {!extractedText && !loading && (
              <div className="space-y-12 md:space-y-20">
                <div className="text-center space-y-8">
                  <div className="inline-flex items-center justify-center">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                      <div className="relative p-5 bg-dark-800/80 backdrop-blur-sm rounded-3xl border border-dark-700/50 shadow-xl transform group-hover:scale-105 transition-all duration-300">
                        <BookOpen className="w-20 h-20 text-dark-100" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                      AI PDF Chat Assistant
                    </h1>
                    <p className="text-dark-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                      Transform your PDF documents into interactive conversations. Upload your file and start asking questions to get instant, intelligent responses.
                    </p>
                  </div>
                </div>

                <FileUpload onFileSelect={handleFileSelect} error={error} />

                <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-dark-800/40 backdrop-blur-sm p-8 rounded-2xl border border-dark-700/50 hover:border-dark-500/50 transition-all duration-300 h-full">
                      <div className="p-4 bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-dark-100" />
                      </div>
                      <h3 className="text-2xl text-dark-50 font-semibold mb-4">Easy Upload</h3>
                      <p className="text-dark-300 leading-relaxed">
                        Simply drag and drop your PDF file or click to browse. Supports files up to 2MB in size.
                      </p>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-dark-800/40 backdrop-blur-sm p-8 rounded-2xl border border-dark-700/50 hover:border-dark-500/50 transition-all duration-300 h-full">
                      <div className="p-4 bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Bot className="w-8 h-8 text-dark-100" />
                      </div>
                      <h3 className="text-2xl text-dark-50 font-semibold mb-4">Smart Analysis</h3>
                      <p className="text-dark-300 leading-relaxed">
                        Our AI assistant analyzes your PDF content and provides intelligent, context-aware responses.
                      </p>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-dark-800/40 backdrop-blur-sm p-8 rounded-2xl border border-dark-700/50 hover:border-dark-500/50 transition-all duration-300 h-full">
                      <div className="p-4 bg-gradient-to-br from-dark-700 to-dark-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Shield className="w-8 h-8 text-dark-100" />
                      </div>
                      <h3 className="text-2xl text-dark-50 font-semibold mb-4">Secure & Private</h3>
                      <p className="text-dark-300 leading-relaxed">
                        Your documents are processed securely and not stored on our servers after analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && <LoadingSpinner />}

            {extractedText && !loading && aiInitialized && (
              <ChatInterface extractedText={extractedText} onRestart={handleRestart} />
            )}
          </div>
        </main>

        {!extractedText && !loading && (
          <footer className="bg-dark-800/30 backdrop-blur-sm border-t border-dark-700/50 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-dark-400 text-sm">
                AI PDF Chat Assistant &bull; Private, client-side on-device AI document analysis
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;