import { useComposerStore } from "@/hooks/use-composer-store";
import { renderSmsMessage } from "@/lib/sms-renderer";
import { useEffect, useState } from "react";
import { Battery, Wifi, Signal, ChevronLeft } from "lucide-react";

export function PreviewSms() {
  const { smsContent, testData } = useComposerStore();
  const [renderedText, setRenderedText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderedText(renderSmsMessage(smsContent, testData));
    }, 300);
    return () => clearTimeout(timer);
  }, [smsContent, testData]);

  const charCount = renderedText.length;
  // Calculate segments (GSM-7 assumed for simplicity: 160 chars per segment)
  const segments = charCount > 0 ? Math.ceil(charCount / 160) : 0;
  const isOverLimit = charCount > 320; // 2 segments max recommended

  return (
    <div className="flex flex-col h-full items-center py-6 bg-[#f0f0f0] overflow-y-auto">
      {/* iOS Phone Mockup */}
      <div className="relative w-full max-w-[320px] h-[650px] bg-white rounded-[40px] border-8 border-gray-900 shadow-2xl overflow-hidden flex flex-col font-sans shrink-0 mx-auto">
        
        {/* iOS Status Bar */}
        <div className="h-7 w-full flex justify-between items-center px-6 pt-1 text-[11px] font-medium z-10 text-black shrink-0">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Dynamic Island Notch */}
        <div className="absolute top-2 inset-x-0 mx-auto w-[100px] h-[24px] bg-black rounded-full z-10"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-2 py-3 bg-gray-50/90 backdrop-blur-md border-b border-gray-200 shrink-0 z-0 pt-6">
          <div className="flex items-center text-blue-500">
            <ChevronLeft className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold mb-1">
              H
            </div>
            <div className="text-[11px] font-semibold text-black">Herald</div>
            <div className="text-[10px] text-gray-500">iMessage</div>
          </div>
          <div className="w-6" /> {/* Spacer */}
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white p-4 flex flex-col justify-end overflow-y-auto">
          <div className="flex justify-center mb-4">
            <span className="text-[10px] font-semibold text-gray-400">Today 9:41 AM</span>
          </div>
          
          {renderedText ? (
            <div className="self-start bg-gray-200 text-black rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] text-[15px] leading-snug whitespace-pre-wrap">
              {renderedText}
            </div>
          ) : (
            <div className="self-center text-gray-400 text-sm italic">
              Waiting for input...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="flex-1 h-8 rounded-full border border-gray-300 bg-white px-3 flex items-center text-gray-400 text-sm">
              iMessage
            </div>
          </div>
        </div>
      </div>

      {/* Stats Below Mockup */}
      <div className="mt-4 flex gap-4 text-xs font-medium text-text-muted">
        <div className="flex items-center gap-1.5 bg-white py-1.5 px-3 rounded-full border border-border shadow-sm">
          <span>Characters:</span>
          <span className={`font-bold ${charCount > 160 ? 'text-amber-500' : 'text-foreground'}`}>
            {charCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white py-1.5 px-3 rounded-full border border-border shadow-sm">
          <span>Segments:</span>
          <span className={`font-bold ${isOverLimit ? 'text-red-500' : 'text-foreground'}`}>
            {segments}
          </span>
        </div>
      </div>
      
      {isOverLimit && (
        <p className="mt-2 text-xs text-red-500 max-w-[320px] text-center bg-red-500/10 p-2 rounded border border-red-500/20">
          Warning: Message exceeds 320 characters. This may result in delivery failures or high costs on some carrier networks.
        </p>
      )}
    </div>
  );
}
