"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TestSendDto } from "@/types/api";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Wallet, 
  Tag, 
  Type, 
  FileText, 
  Eye, 
  Send,
  MessageSquare,
  Info,
  HelpCircle
} from "lucide-react";

interface TelegramComposerProps {
  onPreview: (dto: TestSendDto) => void;
  onSend: (dto: TestSendDto) => void;
  isLoading: boolean;
}

const CATEGORIES = ["defi", "governance", "system", "marketing"] as const;

const MARKDOWN_HELP = `Telegram HTML Formatting:
<b>bold</b> or <i>italic</i>
<code>inline code</code>
<pre>code block</pre>
<a href="https://example.com">link</a>

Markdown Shortcuts (auto-converted):
**bold** → <b>bold</b>
*italic* → <i>italic</i>
\`code\` → <code>code</code>
[text](url) → inline button
`;

export function TelegramComposer({ onPreview, onSend, isLoading }: TelegramComposerProps) {
  const [walletAddress, setWalletAddress] = useState("HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH");
  const [subject, setSubject] = useState("Liquidation Warning");
  const [body, setBody] = useState("Your margin account is nearing liquidation threshold.\n\n*Action Required:* Deposit more collateral to avoid liquidation.\n\nCheck your [dashboard](https://solend.fi) for details.");
  const [category, setCategory] = useState<TestSendDto["category"]>("defi");

  const buildDto = (previewOnly = false): TestSendDto => ({
    walletAddress,
    subject,
    body,
    category,
    previewOnly,
  });

  return (
    <div className="bg-navy-2/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] h-full flex flex-col group/composer">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <MessageSquare className="w-5 h-5" />
            </span>
            Telegram Composer
          </h3>
          <p className="text-xs text-text-muted mt-1 ml-11">
            Send rich messages and inline buttons to Telegram users.
          </p>
        </div>
      </div>
      
      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1">
              <Wallet className="w-3 h-3 text-teal" />
              Recipient Wallet
            </label>
            <Input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Solana Wallet Address"
              className="w-full font-mono text-xs bg-black/20 border-white/5 focus:border-teal/50 focus:ring-teal/20 transition-all py-5"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1">
              <Tag className="w-3 h-3 text-primary" />
              Category
            </label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as any)}
            >
              <SelectTrigger className="w-full h-[46px] bg-black/20 border-white/5 rounded-xl hover:bg-black/30 transition-all text-sm px-4">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    <span className="capitalize">{c}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1">
            <Type className="w-3 h-3 text-amber-400" />
            Subject
          </label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Notification Subject"
            className="w-full font-semibold bg-black/20 border-white/5 focus:border-teal/50 focus:ring-teal/20 transition-all py-5 text-base"
            required
          />
        </div>

        <div className="space-y-2 flex-1 flex flex-col min-h-[250px]">
          <div className="flex items-center justify-between mb-1 ml-1">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3 text-purple-400" />
              Message (Markdown)
            </label>
            <button 
              type="button" 
              className="text-[10px] text-teal/60 hover:text-teal font-bold uppercase tracking-tighter transition-colors flex items-center gap-1"
              onClick={() => {
                const el = document.getElementById('telegram-help');
                el?.toggleAttribute('hidden');
              }}
            >
              <HelpCircle className="w-3 h-3" />
              Formatting Guide
            </button>
          </div>
          
          <div className="relative flex-1 group/textarea">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-full bg-black/20 border border-white/5 text-foreground text-sm rounded-2xl px-4 py-4 focus:outline-none focus:border-teal/50 focus:ring-4 focus:ring-teal/5 ring-0 transition-all resize-none font-mono leading-relaxed"
              placeholder="Write your Telegram message here..."
              required
            />
            
            <div 
              id="telegram-help" 
              hidden 
              className="absolute inset-0 z-10 bg-navy/95 backdrop-blur-md rounded-2xl p-6 border border-teal/20 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-teal flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Telegram Guide
                </h4>
                <button 
                  onClick={() => document.getElementById('telegram-help')?.setAttribute('hidden', '')}
                  className="text-text-muted hover:text-white transition-colors"
                >
                  <Type className="w-4 h-4 rotate-45" />
                </button>
              </div>
              <pre className="text-xs text-text-muted bg-black/40 p-4 rounded-xl border border-white/5 leading-relaxed font-mono">
                {MARKDOWN_HELP}
              </pre>
              <div className="mt-4 p-4 rounded-xl bg-teal/5 border border-teal/10 space-y-2">
                <p className="text-xs text-foreground font-medium">
                  <strong>Pro Tip:</strong> Markdown links <code>[Text](url)</code> automatically become premium inline keyboard buttons in Telegram.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 mt-6 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
        <Button 
          variant="secondary" 
          onClick={() => onPreview(buildDto(true))}
          disabled={isLoading || !walletAddress || !subject || !body}
          className="px-6 py-5 rounded-xl border-white/5 hover:bg-white/5 text-sm font-bold gap-2 group/prev"
        >
          <Eye className="w-4 h-4 text-text-muted group-hover/prev:text-teal transition-colors" />
          Preview
        </Button>
        <Button 
          variant="default"
          isLoading={isLoading}
          disabled={isLoading || !walletAddress || !subject || !body}
          onClick={() => onSend(buildDto(false))}
          className="px-8 py-5 rounded-xl bg-linear-to-r from-teal to-teal-2 text-navy text-sm font-bold gap-2 shadow-[0_10px_30px_rgba(0,200,150,0.3)] hover:shadow-[0_15px_40px_rgba(0,200,150,0.4)] transition-all"
        >
          <Send className="w-4 h-4" />
          Dispatch Telegram
        </Button>
      </div>
    </div>
  );
}