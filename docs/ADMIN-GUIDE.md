# PAKMOO CMS — release 2910

Sign in at `/admin/login`. The previous `/login` URL still works. Existing administrator passwords remain valid; a successful login upgrades legacy hashes to bcrypt. Passwords are never included in Git.

## Content and publication

Use **Pages** to edit each page's sections. The fields follow the existing page content. Global header/footer/quote content is grouped under **Global** and linked from **Menus**. Pages do not share one undifferentiated content textarea. Repeatable sections support adding, removing, dragging, moving and visibility controls. Existing styling and animations remain in the public components.

Use **Products, Categories, Applications, Standards, Clients, Testimonials, Services** for collection records. Search and status filters appear above the lists; select rows for bulk actions and drag rows to change their order. A slug is suggested when creating a record; review it before publishing. Four duplicate Firebase product slugs were retained as separate records with distinct canonical URLs rather than discarded.

**Save draft** keeps the last published content online. **Publish** makes the current draft public. **Unpublish** removes the published snapshot. A revision restore creates a draft; review and publish it separately. The last ten revisions are retained. If another administrator has saved the same item, reload to resolve the version conflict.

Blog and author management use the existing modules. Blogs now also have revision history, schema, extended Twitter fields and live SEO/readability scores. Saving a blog draft retains the previous publication; use the explicit Unpublish action to take it offline.

## Editor and media

The existing rich text editor supports headings, lists, formatting, links, HTML source and image upload with alt text/caption. Use **Insert table** for table content. Apply HTML source edits before saving the containing form.

Images accept JPEG, PNG or WebP up to 5 MB. New images are decoded, resized to a maximum 2400-pixel side without enlarging and re-encoded. PDF brochures accept up to 10 MB and are served as downloads. The media library supports search, alt/caption changes and copying URLs. Files referenced by content, posts, authors or settings cannot be deleted until those references are removed.

## SEO

Each edit form provides metadata, canonical/robots settings, social previews and structured data. Scores are editorial heuristics, not ranking guarantees. Review the individual fixes rather than trying to maximize every score mechanically. Product prices and ratings are optional; publish only genuine values.

Global defaults, verification codes, indexing and sitemap controls are in **Site Settings → SEO**. Redirects support 301 and 302; loops and protected-route overrides are rejected. Sitemaps contain indexable published content; drafts and off-site canonical duplicates are excluded.

## Contact, enquiries and email

**Site Settings → Contact** supplies shared address, phones, email, WhatsApp and hours. Contact and quote submissions are saved in **Enquiries** before email delivery is attempted. The inbox shows delivery status, read state, internal notes and workflow status, with a CSV export.

Configure **Site Settings → Enquiry email / SMTP** with a real sender, receiving addresses and optional CC/BCC and auto-reply. Save, then send a test email to an approved recipient. A blank SMTP password preserves the existing encrypted password. Check delivery and spam folders. Failed queued messages can be retried from this panel. The server needs a stable `CMS_SECRET_KEY` to encrypt SMTP settings and email jobs.

**No real SMTP credentials were supplied with the project requirements.** Local SMTP protocol/OTP tests use an isolated test sink and send no external mail. Live email delivery and password-reset mail require the owner's SMTP configuration. Until configured, enquiries remain saved with a `not_configured` delivery state. Password reset returns a generic request message for privacy; it cannot deliver an OTP without SMTP.

Use `/admin/forgot-password` to request a six-digit code. Codes expire in ten minutes, can be used once, permit at most five incorrect entries, and have a 60-second resend cooldown. A successful password reset invalidates existing sessions. **Profile** supports changing the current password and verifying both mailboxes when changing the administrator email. The initial reset email defaults to `juhityagi09@gmail.com`; update it through the verified account flow when required.

## Roles, scripts and legal content

Super Admins control users, settings, menus, scripts and redirects. Editors manage content, authors, media and enquiries. Keep at least one active Super Admin. User changes revoke that user's existing sessions. Recent changes appear in the audit log under **Users**.

Custom scripts and CSS execute site-wide and are restricted to Super Admins. Leave them empty unless intentionally configuring an integration. Maintenance mode defaults off and leaves admin sign-in accessible.

Privacy Policy and Terms of Service are seeded as drafts because the previous site contained placeholder links and no policy content. Enter owner-approved text and publish before linking those pages in the footer.

## Storage, backup and recovery

SQLite stores administrator accounts, sessions, blogs/authors, page/collection drafts and publications, enquiries, revisions, audit entries, redirects and media metadata. Firebase data is not deleted by this release; the 85-record product snapshot is imported once into SQLite.

- Local default: `.data/website.sqlite` and `.data/uploads`.
- Explicit override: `DATA_DIRECTORY`.
- Hostinger Node deployment default: `/home/<hosting-user>/domains/<domain>/private-data`, outside versioned `hbuilds` directories and outside `public_html`.

Back up the database with SQLite's backup mechanism or a stopped-server copy that includes committed WAL changes, together with uploads and the encryption key. A database backup alone cannot decrypt encrypted settings without the original key. Keep backups private. Never run an administrator reset or destructive seed command as part of normal deployment.

The one-time `scripts/prepare-hostinger-data.mjs` is scoped to the existing pakmoo.in hosting account and copies the previous deployment's database/uploads to private persistent storage with an integrity check. The npm prebuild/postbuild hooks run it automatically on the existing Hostinger account: the final snapshot includes changes made while the build was running. The private `.cms-secret` file supplies an encryption key when CMS_SECRET_KEY is not configured; preserve this file with backups. Verify the live login, content, uploads and persistence after deployment.
