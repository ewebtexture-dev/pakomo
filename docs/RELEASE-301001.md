# Release 301001

Commit message: `301001`. Package version: `1.0.301001`.

Removes unused legacy source/UI files and dependencies; removes SEO/schema inputs from clients, testimonials and gallery items; bundles Font Awesome social icons locally; makes blog featured images responsive for 1920 × 1080 uploads and article images use natural sizes; fixes dashboard layers blocking navigation; and adds a protected Firebase configuration module with Google sign-in/read checks.

Validation: production build, lint, CMS checks, local add/edit API checks, and browser checks covering all 21 sidebar links, social icon fonts/URLs, and blog list/details at 320, 375, 768, 1024, 1280 and 1536px. See [local change details](LOCAL-UPDATES-2026-10-30.md) and [terminal commands](LOCAL-TEST-AND-DEPLOY.md).

Firebase migration is separate from this code release: 85 source product documents have been copied and verified in `pakmoo-bd1d6`. The 116 source Storage files are backed up, but destination Storage migration still requires Blaze billing, and a full old-project audit requires administrative access. Existing image URLs remain intact. This release does not disconnect or delete the old project, migrate the CMS SQLite database, expose backups, or change administrator passwords. Firebase Web configuration is saved through the protected settings API and kept out of committed environment files; CMS data/uploads remain in persistent private storage.
