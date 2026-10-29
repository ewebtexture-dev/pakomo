# Release 2910:02

Commit message: 2910:02. Package version: 1.0.291002.

Adds page-specific FAQs, a gallery manager and public lightbox, editable blog categories, scheduled publication, image display controls, managed social links and shared responsive rich-content formatting. Gallery images and testimonials no longer expose SEO fields. Existing public styling is reused; galleries and new FAQ sections are absent until content is published.

Validation commands:

- npm run build
- npm run check:cms
- node scripts/check-release-2910-02.mjs
- node scripts/check-release-2910-02-ui.mjs (requires a local Chromium CDP session on port 9222)
- node scripts/check-admin-ui.mjs

The release UI suite creates temporary local gallery items, a category and an article, tests image uploads, accessibility, social/schema output and 15 public page templates at 320, 375, 768, 1024, 1280 and 1536 pixels, then removes the temporary content and restores social settings. The API suite checks AVIF conversion, safe publication, FAQ/schema visibility, relationships, sanitization and request-time scheduling. SMTP still requires owner configuration as documented in the admin guide.
