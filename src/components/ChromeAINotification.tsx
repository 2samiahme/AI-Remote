import { useEffect } from 'react';
import toast from 'react-hot-toast';

let hasShownNotification = false;

const ChromeAINotification = () => {
  useEffect(() => {
    // If any cloud AI key (Grok, OpenAI, Anthropic, Gemini) is configured, Chrome on-device AI is optional
    const hasCloudAI = Boolean(
      import.meta.env.VITE_GROK_API_KEY ||
      import.meta.env.VITE_OPENAI_API_KEY ||
      import.meta.env.VITE_ANTHROPIC_API_KEY ||
      import.meta.env.VITE_GEMINI_API_KEY
    );

    if (hasCloudAI) return;
    if (hasShownNotification) return;
    
    const showNotification = () => {
      hasShownNotification = true;
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-black/85 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-2xl pointer-events-auto relative overflow-hidden p-5 transition-all`}
          >
            {/* Subtle glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent rounded-2xl blur-lg opacity-40 pointer-events-none"></div>

            {/* Close button */}
            <button 
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="absolute top-3.5 right-3.5 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border border-white/10"
              aria-label="Close notification"
            >
              <span className="text-sm font-light">✕</span>
            </button>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <p className="text-base font-semibold text-white flex items-center tracking-tight">
                    <span className="mr-2 text-lg">🤖</span>
                    Chrome AI Feature Required
                  </p>
                </div>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">
                  This experimental project requires Chrome's built-in AI capabilities or cloud API keys in your .env. 
                  Please use <span className="font-semibold text-white">Chrome Canary</span> or 
                  <span className="font-semibold text-white"> Chrome Dev</span> with AI features enabled.
                </p>
                <div className="mt-3 flex items-center text-xs text-white/50">
                  <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Standard Chrome browsers are not supported without API keys
                </div>
              </div>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: 'bottom-right',
        }
      );
    };

    showNotification();
  }, []);

  return null;
};

export default ChromeAINotification;
