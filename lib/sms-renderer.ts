import { interpolateVariables } from "./email-renderer";

export function renderSmsMessage(text: string, testData: Record<string, string>): string {
  // Strip all HTML tags
  let plainText = text.replace(/<br\s*[\/]?>/gi, "\n");
  plainText = plainText.replace(/<\/p>\s*<p>/gi, "\n\n");
  plainText = plainText.replace(/<[^>]*>?/gm, "");
  
  // Decode common HTML entities
  plainText = plainText
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return interpolateVariables(plainText, testData);
}
