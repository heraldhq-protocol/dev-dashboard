import { useComposerStore } from "@/hooks/use-composer-store";
import { renderEmailHtml, stripMentionSpans } from "@/lib/email-renderer";
import { previewNotification } from "@/lib/api/notifications";
import { usePlaygroundKey } from "@/hooks/use-playground-key";
import { useEffect, useState, useRef } from "react";
import { Smartphone, Monitor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PreviewEmail() {
  const { emailContent, emailSubject, testData } = useComposerStore();
  const { activeKey } = usePlaygroundKey();
  const [html, setHtml] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      // Strip TipTap mention spans, then interpolate variables
      const interpolated = stripMentionSpans(emailContent).replace(
        /{{\s*([^}]+?)\s*}}/g,
        (match, key) => testData[key.trim()] ?? match,
      );
      const subject = emailSubject.replace(
        /{{\s*([^}]+?)\s*}}/g,
        (match, key) => testData[key.trim()] ?? match,
      );

      if (activeKey.startsWith("hrld_test_")) {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setIsLoadingPreview(true);
        try {
          const result = await previewNotification(
            { walletAddress: "preview", subject, body: interpolated, category: "system" },
            activeKey,
            "email",
          );
          if (result.renderedHtml) {
            setHtml(result.renderedHtml);
            return;
          }
        } catch {
          // fall through to local renderer
        } finally {
          setIsLoadingPreview(false);
        }
      }

      // Local fallback: content is TipTap HTML — interpolate and wrap in a clean shell
      setHtml(renderEmailHtml(interpolated, {}));
    }, 400);
    return () => clearTimeout(timer);
  }, [emailContent, emailSubject, testData, activeKey]);

  const subjectLine = emailSubject
    ? emailSubject.replace(/{{\s*([^}]+?)\s*}}/g, (match, key) => testData[key.trim()] ?? match)
    : "(No subject)";

  return (
    <div className="flex flex-col h-full">
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b border-border p-3 bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-teal/20 flex items-center justify-center text-teal text-xs font-bold">H</div>
          <div>
            <div className="text-xs font-semibold text-foreground">{subjectLine}</div>
            <div className="text-[10px] text-text-muted">From: noreply@useherald.xyz</div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-card-2 p-1 rounded-md border border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDevice("desktop")}
            className={`h-6 w-6 rounded-sm ${device === "desktop" ? "bg-card shadow-sm text-foreground" : "text-text-muted"}`}
          >
            <Monitor className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDevice("mobile")}
            className={`h-6 w-6 rounded-sm ${device === "mobile" ? "bg-card shadow-sm text-foreground" : "text-text-muted"}`}
          >
            <Smartphone className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-gray-100 overflow-y-auto flex justify-center py-6">
        <div 
          className={`bg-white shadow-xl overflow-hidden transition-all duration-300 max-w-full ${
            device === "mobile" ? "w-full sm:w-[375px] rounded-3xl min-h-[667px]" : "w-full max-w-[600px] rounded-lg min-h-full"
          }`}
        >
          {isLoadingPreview ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
              <Loader2 className="w-5 h-5 animate-spin mb-2 opacity-40" />
              <p className="text-xs opacity-50">Rendering template…</p>
            </div>
          ) : html ? (
            <iframe
              title="Email Preview"
              srcDoc={html}
              className="w-full h-full min-h-[400px] border-0"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
              <Monitor className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs">No content to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
