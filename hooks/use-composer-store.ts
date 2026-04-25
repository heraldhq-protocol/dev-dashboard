import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChannelTab = "email" | "telegram" | "sms";

export interface ComposerState {
  activeChannel: ChannelTab;
  
  // Editor content per channel
  emailContent: string;
  telegramContent: string;
  smsContent: string;
  
  // Channel specific settings
  emailSubject: string;
  telegramParseMode: "MarkdownV2" | "HTML";
  
  // Test Data for preview
  testData: Record<string, string>;
  
  // Actions
  setActiveChannel: (channel: ChannelTab) => void;
  setContent: (channel: ChannelTab, content: string) => void;
  setEmailSubject: (subject: string) => void;
  setTelegramParseMode: (mode: "MarkdownV2" | "HTML") => void;
  setTestData: (key: string, value: string) => void;
  removeTestData: (key: string) => void;
  resetDraft: (channel: ChannelTab) => void;
}

const DEFAULT_CONTENT = {
  email: "<p>Hello {{name}},</p><p>This is a test notification from your protocol.</p>",
  telegram: "Hello {{name}},\n\nThis is a test notification from your protocol.",
  sms: "Hello {{name}},\n\nThis is a test notification from your protocol.",
};

export const useComposerStore = create<ComposerState>()(
  persist(
    (set) => ({
      activeChannel: "email",
      
      emailContent: DEFAULT_CONTENT.email,
      telegramContent: DEFAULT_CONTENT.telegram,
      smsContent: DEFAULT_CONTENT.sms,
      
      emailSubject: "Test Notification",
      telegramParseMode: "MarkdownV2",
      
      testData: {
        name: "User",
        amount: "100.50 USDC",
      },
      
      setActiveChannel: (channel) => set({ activeChannel: channel }),
      
      setContent: (channel, content) => set(() => {
        if (channel === "email") return { emailContent: content };
        if (channel === "telegram") return { telegramContent: content };
        return { smsContent: content };
      }),
      
      setEmailSubject: (subject) => set({ emailSubject: subject }),
      setTelegramParseMode: (mode) => set({ telegramParseMode: mode }),
      
      setTestData: (key, value) => set((state) => ({
        testData: { ...state.testData, [key]: value }
      })),
      
      removeTestData: (key) => set((state) => {
        const newData = { ...state.testData };
        delete newData[key];
        return { testData: newData };
      }),
      
      resetDraft: (channel) => set(() => {
        if (channel === "email") return { emailContent: DEFAULT_CONTENT.email, emailSubject: "Test Notification" };
        if (channel === "telegram") return { telegramContent: DEFAULT_CONTENT.telegram };
        return { smsContent: DEFAULT_CONTENT.sms };
      }),
    }),
    {
      name: "herald-composer-storage",
    }
  )
);
