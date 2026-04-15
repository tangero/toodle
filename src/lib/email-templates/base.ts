export function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #111827; margin: 0; font-size: 20px;">Letní škola AI</h2>
      </div>
      ${body}
    </div>
    <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} Letní škola AI</p>
    </div>
  </div>
</body>
</html>`;
}
