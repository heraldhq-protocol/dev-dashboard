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
  MessageCircle,
  Hash,
  AlertCircle
} from "lucide-react";

interface SmsComposerProps {
  onPreview: (dto: TestSendDto) => void;
  onSend: (dto: TestSendDto) => void;
  isLoading: boolean;
}

const CATEGORIES = ["defi", "governance", "system", "marketing"] as const;

const SMS_LIMITS = {
  defi: 320,
  system: 320,
  governance: 160,
  marketing: 160,
};

export function SmsComposer({ onPreview, onSend, isLoading }: SmsComposerProps) {
  const [walletAddress, setWalletAddress] = useState("HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH");
  const [subject, setSubject] = useState("Alert");
  const [body, setBody] = useState("Your account requires attention. Please check your dashboard.");
  const [category, setCategory] = useState<TestSendDto["category"]>("defi");

  const maxChars = SMS_LIMITS[category] || 160;
  const prefix = `[${subject}]: `;
  const suffix = " (via Herald)";
  const bodyLimit = maxChars - prefix.length - suffix.length;
  const charCount = body.length;
  const isOverLimit = charCount > bodyLimit;

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
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <MessageCircle className="w-5 h-5" />
            </span>
            SMS Composer
          </h3>
          <p className="text-xs text-text-muted mt-1 ml-11">
            Send high-priority text alerts directly to mobile devices.
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
                    <span className="capitalize">{c} ({SMS_LIMITS[c]} chars)</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 ml-1">
            <Type className="w-3 h-3 text-amber-400" />
            Short Subject
          </label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Alert"
            className="w-full font-semibold bg-black/20 border-white/5 focus:border-teal/50 focus:ring-teal/20 transition-all py-5 text-base"
            maxLength={20}
            required
          />
          <p className="text-[10px] text-text-muted ml-1 italic font-medium">Keep it brief — SMS has strict character limits.</p>
        </div>

        <div className="space-y-2 flex-1 flex flex-col min-h-[200px]">
          <div className="flex items-center justify-between mb-1 ml-1">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3 text-purple-400" />
              SMS Content
            </label>
            <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 px-2 py-1 rounded-md ${isOverLimit ? "bg-red/10 text-red" : "bg-teal/10 text-teal"}`}>
              {charCount}/{bodyLimit} Characters
            </div>
          </div>
          
          <div className="relative flex-1 group/textarea">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`w-full h-full bg-black/20 border ${isOverLimit ? "border-red/50 focus:ring-red/5" : "border-white/5 focus:border-teal/50 focus:ring-teal/5"} text-foreground text-sm rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 transition-all resize-none font-mono leading-relaxed`}
              placeholder="Write your SMS message here..."
              required
            />
            
            {isOverLimit && (
              <div className="absolute bottom-4 right-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="flex items-center gap-2 bg-red/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-xl">
                  <AlertCircle className="w-3 h-3" />
                  Length Exceeded
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-4 rounded-xl bg-navy/40 border border-white/5 flex items-start gap-3">
            <Hash className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
            <p className="text-[11px] text-text-muted leading-relaxed">
              <strong>Tip:</strong> Links are automatically stripped from SMS to ensure maximum deliverability across global carriers. Use Email or Telegram for interactive link support.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-8 mt-6 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
        <Button 
          variant="secondary" 
          onClick={() => onPreview(buildDto(true))}
          disabled={isLoading || !walletAddress || !subject || !body || isOverLimit}
          className="px-6 py-5 rounded-xl border-white/5 hover:bg-white/5 text-sm font-bold gap-2 group/prev"
        >
          <Eye className="w-4 h-4 text-text-muted group-hover/prev:text-teal transition-colors" />
          Preview
        </Button>
        <Button 
          variant="default"
          isLoading={isLoading}
          disabled={isLoading || !walletAddress || !subject || !body || isOverLimit}
          onClick={() => onSend(buildDto(false))}
          className="px-8 py-5 rounded-xl bg-linear-to-r from-teal to-teal-2 text-navy text-sm font-bold gap-2 shadow-[0_10px_30px_rgba(0,200,150,0.3)] hover:shadow-[0_15px_40px_rgba(0,200,150,0.4)] transition-all"
        >
          <Send className="w-4 h-4" />
          Dispatch SMS
        </Button>
      </div>
    </div>
  );
}