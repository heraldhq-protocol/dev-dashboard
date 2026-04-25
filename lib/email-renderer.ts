export function interpolateVariables(template: string, data: Record<string, string>): string {
  if (!template) return "";
  return template.replace(/{{\s*([^}]+?)\s*}}/g, (match, key) => {
    const value = data[key.trim()];
    return value !== undefined ? value : match;
  });
}

export function renderEmailHtml(htmlContent: string, testData: Record<string, string>): string {
  const interpolated = interpolateVariables(htmlContent, testData);
  
  // Basic email wrapper to ensure it renders cleanly in the iframe
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            border: 1px solid #e5e5e5;
          }
          p { margin-top: 0; margin-bottom: 16px; }
          a { color: #00c896; text-decoration: none; }
          a:hover { text-decoration: underline; }
          code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 4px;
            font-size: 0.9em;
          }
          .mention {
            color: #00c896;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          ${interpolated}
        </div>
      </body>
    </html>
  `;
}
