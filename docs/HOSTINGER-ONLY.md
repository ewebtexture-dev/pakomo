# Hostinger-only website

Content, blog posts, authors, users and settings are stored in the existing private SQLite database. Imported images and new admin uploads are served from the site's own `/media/` URLs. No Firebase SDK, Google sign-in integration or Firebase connection settings remain active.

The release includes 116 checksum-verified original images as deployment assets. A backed-up startup migration installs them into persistent private uploads, registers them in Media Library and converts references from both former Firebase buckets to local media URLs. Existing image bytes, content, publication status, authors and passwords are preserved. The compatibility map only identifies historical URLs; it contains no active cloud download URLs or administrator credentials.

The configured owner/recovery email is `juhityagi09@gmail.com`. Existing admin passwords continue to work. Pre-migration login sessions and recovery grants are revoked once, so sign in again after deployment. Email alone cannot authorise changes; recovery requires an expiring, single-use emailed OTP and a valid reset grant. Delivery requires working SMTP settings under Site Settings. Existing authorised admin/editor roles remain unless the owner explicitly requests an owner-only account policy.

Public pages and images remain readable. All content/media changes require an active admin session; write endpoints also validate the request's Origin. Visitors can still submit enquiries. Keep control of the Hostinger and GitHub accounts, since those credentials can deploy code outside the CMS.

Persistent live data is under `/home/u835816219/domains/pakmoo.in/private-data`. Automatic pre-cutover SQLite backups remain private in that directory. Do not expose `.data`, private-data, environment files, database backups or SMTP credentials in the public document root.

Local `.env` no longer contains `NEXT_PUBLIC_FIREBASE_*` values. Set `ADMIN_RESET_EMAIL=juhityagi09@gmail.com` for a new installation and keep a stable `CMS_SECRET_KEY`. Retired cloud projects and their stored backups are not deleted by this change.
