import { useComposerStore } from "@/hooks/use-composer-store";
import { renderTelegramMessage } from "@/lib/telegram-renderer";
import { useEffect, useState } from "react";
import { MoreVertical, Paperclip, Smile, Mic } from "lucide-react";

export function PreviewTelegram() {
  const { telegramContent, telegramParseMode, testData } = useComposerStore();
  const [renderedText, setRenderedText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderedText(renderTelegramMessage(telegramContent, testData, telegramParseMode));
    }, 300);
    return () => clearTimeout(timer);
  }, [telegramContent, telegramParseMode, testData]);

  // Rough MarkdownV2 to HTML converter just for visual preview
  const formatMarkdown = (text: string) => {
    if (!text) return { __html: "" };
    const formatted = text
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code class='bg-black/20 px-1 rounded'>$1</code>")
      .replace(/\n/g, "<br/>");
    return { __html: formatted };
  };

  return (
    <div className="flex flex-col h-full bg-[#0e1621] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#17212b] border-b border-[#101921] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <div>
            <div className="text-[#f5f5f5] font-semibold text-[15px]">Herald Bot</div>
            <div className="text-[#7f91a4] text-[13px]">bot</div>
          </div>
        </div>
        <MoreVertical className="text-[#7f91a4] w-5 h-5" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end bg-linear-to-b from-[#0e1621] to-[#121b27]">
        <div className="flex justify-center mb-4">
          <span className="bg-[#17212b] text-[#7f91a4] text-xs px-3 py-1 rounded-full font-medium">
            Today
          </span>
        </div>
        
        {renderedText ? (
          <div className="max-w-[85%] self-start bg-[#182533] text-[#f5f5f5] rounded-2xl rounded-tl-none p-3 shadow-sm relative group">
            <div 
              className="text-[15px] leading-relaxed wrap-break-word"
              dangerouslySetInnerHTML={telegramParseMode === "MarkdownV2" ? formatMarkdown(renderedText) : { __html: renderedText }}
            />
            <div className="text-right mt-1">
              <span className="text-[#7f91a4] text-[11px] select-none">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ) : (
          <div className="self-center text-[#7f91a4] text-sm italic">
            Waiting for input...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-[#17212b] p-3 shrink-0 flex items-center gap-3">
        <Paperclip className="text-[#7f91a4] w-6 h-6 shrink-0" />
        <div className="flex-1 bg-[#242f3d] rounded-full px-4 py-2.5 text-[#7f91a4] text-[15px]">
          Message
        </div>
        <Smile className="text-[#7f91a4] w-6 h-6 shrink-0" />
        <Mic className="text-[#7f91a4] w-6 h-6 shrink-0" />
      </div>
    </div>
  );
}
