import { motion } from "framer-motion";
import { Mail, MessageCircle, MessageSquare } from "lucide-react";
import { useComposerStore, ChannelTab } from "@/hooks/use-composer-store";

const TABS: { id: ChannelTab; label: string; icon: React.ReactNode }[] = [
  { id: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
  { id: "telegram", label: "Telegram", icon: <MessageCircle className="w-4 h-4" /> },
  { id: "sms", label: "SMS", icon: <MessageSquare className="w-4 h-4" /> },
];

export function ChannelToggle() {
  const { activeChannel, setActiveChannel } = useComposerStore();

  return (
    <div className="flex border-b border-border bg-card">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveChannel(tab.id)}
          className={`relative flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors ${
            activeChannel === tab.id
              ? "text-primary"
              : "text-text-muted hover:text-foreground hover:bg-white/5"
          }`}
        >
          {tab.icon}
          {tab.label}
          
          {activeChannel === tab.id && (
            <motion.div
              layoutId="activeTabUnderline"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          {activeChannel === tab.id && (
            <motion.div
              layoutId="activeTabBackground"
              className="absolute inset-0 bg-primary/5"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
