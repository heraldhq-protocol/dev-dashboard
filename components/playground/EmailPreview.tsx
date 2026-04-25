"use client";

import { 
  Eye, 
  Mail, 
  Loader2, 
  Monitor,
  Smartphone,
  CheckCircle2
} from "lucide-react";

interface EmailPreviewProps {
  htmlSnippet: string | null;
  isLoading: boolean;
}

export function EmailPreview({ htmlSnippet, isLoading }: EmailPreviewProps) {
  return (
    <div className="bg-navy-2/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] h-full min-h-[400px] lg:min-h-0 flex flex-col overflow-hidden group/preview">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green/40" />
          </div>
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
            <Monitor className="w-3.5 h-3.5" />
            Live Preview
          </h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
          <div className={`w-1.5 h-1.5 rounded-full ${htmlSnippet ? "bg-green animate-pulse" : "bg-text-dim"}`} />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">
            {htmlSnippet ? "Rendered" : "Idle"}
          </span>
        </div>
      </div>
      
      <div className="flex-1 bg-[#fcfcfc] relative overflow-hidden m-4 rounded-xl border border-black/10 shadow-inner">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-white">
            <Loader2 className="w-8 h-8 text-teal animate-spin mb-4" />
            <p className="text-xs font-bold text-navy/40 uppercase tracking-widest">Rendering View...</p>
          </div>
        ) : htmlSnippet ? (
          <div className="w-full h-full overflow-auto p-0 scrollbar-thin scrollbar-thumb-gray-200">
            <div 
              className="max-w-full"
              dangerouslySetInnerHTML={{ __html: htmlSnippet }} 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-navy/20 bg-white">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-teal/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <Mail className="w-16 h-16 relative z-10 opacity-10" strokeWidth={1} />
            </div>
            <h4 className="text-sm font-bold text-navy/40 uppercase tracking-widest mb-1">
              Waiting for Content
            </h4>
            <p className="text-[11px] font-medium text-navy/30 max-w-[180px] text-center leading-relaxed">
              Dispatch a preview from the composer to see the rendered HTML output.
            </p>
          </div>
        )}
      </div>
      
      <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between bg-black/10 text-[10px] text-text-muted font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3 h-3" />
            Responsive
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-green" />
            Verifiable
          </span>
        </div>
        <span className="font-mono opacity-50 uppercase tracking-tighter">
          Herald Engine v2.0
        </span>
      </div>
    </div>
  );
}
