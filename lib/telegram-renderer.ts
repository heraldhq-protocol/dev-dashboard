import { interpolateVariables } from "./email-renderer";

export function renderTelegramMessage(
  text: string, 
  testData: Record<string, string>, 
  parseMode: "MarkdownV2" | "HTML"
): string {
  // Convert basic HTML tags if the input comes from the TipTap HTML output
  // For telegram, we just do a rough mapping for preview purposes.
  // Real implementation on backend would be robust.
  let parsed = text;
  
  // Remove wrapping P tags and convert internal P to double newlines
  parsed = parsed.replace(/<\/p>\s*<p>/gi, '\n\n');
  parsed = parsed.replace(/<\/?p>/gi, '');
  
  if (parseMode === "MarkdownV2") {
    // Convert strong to *bold*
    parsed = parsed.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '*$1*');
    parsed = parsed.replace(/<b[^>]*>(.*?)<\/b>/gi, '*$1*');
    // Convert em to _italic_
    parsed = parsed.replace(/<em[^>]*>(.*?)<\/em>/gi, '_$1_');
    parsed = parsed.replace(/<i[^>]*>(.*?)<\/i>/gi, '_$1_');
    // Convert code
    parsed = parsed.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    // Strip other tags
    parsed = parsed.replace(/<[^>]*>?/gm, '');
  } else {
    // Keep standard tags like <b>, <i>, <code>, <a> for Telegram HTML mode
    // Just remove mention spans etc.
    parsed = parsed.replace(/<span class="mention"[^>]*data-id="([^"]+)"[^>]*>.*?<\/span>/gi, '{{$1}}');
  }

  return interpolateVariables(parsed, testData);
}
