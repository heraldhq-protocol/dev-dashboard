import { useComposerStore } from "@/hooks/use-composer-store";
import { PreviewEmail } from "./preview-email";
import { PreviewTelegram } from "./preview-telegram";
import { PreviewSms } from "./preview-sms";
import { TestDataPanel } from "./test-data-panel";

export function ComposerPreview() {
  const { activeChannel } = useComposerStore();

  return (
    <div className="flex flex-col h-full bg-card-2/50 relative">
      <div className="flex-1 overflow-hidden relative">
        {activeChannel === "email" && <PreviewEmail />}
        {activeChannel === "telegram" && <PreviewTelegram />}
        {activeChannel === "sms" && <PreviewSms />}
      </div>
      
      <div className="shrink-0">
        <TestDataPanel />
      </div>
    </div>
  );
}
