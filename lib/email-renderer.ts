const HERALD_LOGO = "https://herald-storage-bucket.s3.eu-north-1.amazonaws.com/herald-logo.svg";

export function interpolateVariables(template: string, data: Record<string, string>): string {
  if (!template) return "";
  return template.replace(/{{\s*([^}]+?)\s*}}/g, (match, key) => {
    const value = data[key.trim()];
    return value !== undefined ? value : match;
  });
}

/** Strip TipTap mention span wrappers, keeping their plain text content. */
export function stripMentionSpans(html: string): string {
  return html.replace(/<span[^>]*class="mention"[^>]*>([^<]*)<\/span>/g, "$1");
}

export function renderEmailHtml(htmlContent: string, testData: Record<string, string>): string {
  const cleaned = stripMentionSpans(htmlContent);
  const interpolated = interpolateVariables(cleaned, testData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Email Preview</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box}
  body{margin:0;padding:0;background:#F8FAFC;color:#0F172A;
    font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased}
  .wrap{width:100%;background:#F8FAFC;padding:32px 16px}
  .container{max-width:600px;margin:0 auto}
  .header{padding:8px 4px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
  .brand{display:flex;align-items:center;gap:12px}
  .brand-name{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;letter-spacing:-0.01em;color:#0F172A}
  .card{background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;padding:36px 32px}
  .eyebrow{display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;font-weight:700;color:#F59E0B;margin:0 0 20px}
  .body-text{font-size:15px;line-height:1.6;color:#475569}
  .body-text p{margin:0 0 14px}
  .body-text p:last-child{margin-bottom:0}
  .body-text strong{color:#0F172A;font-weight:600}
  .body-text ul,.body-text ol{margin:0 0 14px;padding-left:22px}
  .body-text a{color:#F59E0B;text-decoration:none}
  .footer{padding:28px 8px 8px}
  .footer-meta{font-size:12.5px;line-height:1.65;color:#64748B;margin:0 0 0}
  .footer-divider{height:1px;background:#E2E8F0;border:0;margin:20px 0 18px}
  .footer-brand{display:flex;align-items:center;gap:0;font-size:12px;color:#64748B}
  .footer-brand a{color:#64748B;text-decoration:none}
  .pipe{color:#CBD5E1;padding:0 4px}
  @media(max-width:600px){.card{padding:28px 22px}}
</style>
</head>
<body>
<div class="wrap"><div class="container">
  <div class="header">
    <div class="brand">
      <img src="${HERALD_LOGO}" width="32" height="32" style="display:block;border-radius:7px;" alt="Herald">
      <span class="brand-name">Herald Preview</span>
    </div>
    <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#64748B;font-weight:700">System</span>
  </div>
  <div class="card">
    <span class="eyebrow">
      <span style="width:6px;height:6px;border-radius:99px;background:#F59E0B;display:inline-block;vertical-align:middle;margin-right:6px;position:relative;top:-1px"></span>
      System
    </span>
    <div class="body-text">${interpolated}</div>
  </div>
  <div class="footer">
    <p class="footer-meta">Delivered securely by Herald Protocol. Your email address is never shared with the sending protocol.</p>
    <hr class="footer-divider">
    <table cellpadding="0" cellspacing="0" style="font-size:12px;color:#64748B">
      <tr>
        <td style="vertical-align:middle;padding-right:6px;line-height:0"><img src="${HERALD_LOGO}" width="20" height="20" style="display:block;border-radius:5px" alt=""></td>
        <td style="vertical-align:middle;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;color:#475569;letter-spacing:-0.01em;padding-right:2px">Herald</td>
        <td style="vertical-align:middle;color:#CBD5E1;padding:0 4px">|</td>
        <td style="vertical-align:middle"><a href="#" style="color:#64748B;text-decoration:none">Unsubscribe</a></td>
        <td style="vertical-align:middle;color:#CBD5E1;padding:0 4px">|</td>
        <td style="vertical-align:middle"><a href="https://useherald.xyz" style="color:#64748B;text-decoration:none">useherald.xyz</a></td>
      </tr>
    </table>
  </div>
</div></div>
</body>
</html>`;
}
