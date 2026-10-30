# Local changes — 30 October 2026

These changes were developed and tested locally before release `301001`. The later release request authorizes publishing the code to GitHub and deploying it to Hostinger. Administrator passwords and existing CMS data are preserved.

## Changes

- Removed 60 unused files after tracing imports from Next.js routes, scripts and configuration: legacy Vite entries/config, obsolete auth/Base44 components, unused UI widgets, unused styles and the commented-out Firebase migration screen. Kept the shared product-category utility, CSS type declarations, CMS seeds, audit/maintenance scripts and content assets.
- Removed unused production dependencies and declared the Tailwind animation plugin directly. The installed dependency tree shrank by 206 packages. Required React/React DOM, Firebase and existing editor/runtime dependencies are retained.
- Clients now join gallery items and testimonials in excluding SEO/schema controls in add/edit forms. Their API validation strips these fields without requiring an SQL migration; client alt text and industries remain supported.
- Social icons use self-hosted Font Awesome 4 (`fa fa-*`); enabled profile URLs, platform-specific share URLs and accessible labels are retained.
- Blog cards use a 16:9 slot for 1920 × 1080 images. Featured/related images scale with automatic height without cropping. Blog rich-content images use natural dimensions and scale down to the available width; captions and alignment remain. The editor preview uses the same automatic sizing.
- Fixed the dashboard background layer intercepting sidebar clicks, scoped its positioning to the dashboard, and kept the admin outside public navigation/footer/widgets. Nested collection routes remain highlighted in the sidebar.
- Added Super Admin Firebase configuration at `/admin/firebase`: validated Web config, optional Google account selection, explicit read-only Firestore check, protected settings API, lazy SDK initialization and per-project app instances. Existing CMS data/uploads stay on persistent local storage. Real new-project sign-in/read checks await the owner's Web config.
- Excluded generated local data/build/browser folders from ESLint traversal and corrected the component generator paths to the active Next.js stylesheet/config.

## Verification

- `npm run build`: passed.
- `npm run lint`: passed.
- `npm run check:cms`: passed (OTP, SEO scoring, repeatable content/author migration).
- `node scripts/check-local-updates.mjs`: passed (SEO exclusion on add/edit, client data preservation, Firebase validation/auth/privacy/settings persistence).
- `node scripts/check-local-updates-ui.mjs`: passed (21 dashboard sidebar links clicked with real mouse events, add/edit forms, gallery SEO absence, Firebase save UI, all eight social icon/font/link mappings, blog list/detail at 320, 375, 768, 1024, 1280 and 1536px). No horizontal overflow, browser console errors or runtime exceptions.

Temporary test records/uploads were deleted and existing settings restored. No real Firebase network calls or Google sign-in were performed during automated checks.

Commit/deployment sequence: [LOCAL-TEST-AND-DEPLOY.md](LOCAL-TEST-AND-DEPLOY.md). Firebase setup and its data scope: [FIREBASE-SETUP.md](FIREBASE-SETUP.md).
