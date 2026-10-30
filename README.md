
**About**

Release `301001` packages the 30 October CMS fixes and optional Firebase setup. See [release notes](docs/RELEASE-301001.md); old Firebase image links stay intact while file migration is pending.

Local updates (30 October 2026): see [testing, commit and deployment commands](docs/LOCAL-TEST-AND-DEPLOY.md) and [new Firebase project setup](docs/FIREBASE-SETUP.md). The optional Firebase connection is configured at `/admin/firebase`; CMS data and image uploads remain on persistent local/Hostinger storage.

## CMS release 2910

The site now extends the original admin into a page and collection CMS, with draft/published snapshots, revisions, media/PDF management, SEO and schema forms, an enquiry inbox, roles and email-based OTP password reset. The existing public design is retained. Product management now uses SQLite after importing the authoritative 85-record Firebase snapshot; Firebase records are not deleted. The older Firebase-only notes below describe the previous release.

See [the admin guide](docs/ADMIN-GUIDE.md) and [the approved field map/schema](docs/cms-audit-2910/README.md). Sign in at `/admin/login` (the legacy `/login` remains supported).

Configure a random server-only `CMS_SECRET_KEY` of at least 32 characters, `SITE_URL`, and persistent `DATA_DIRECTORY` using `.env.example`. Configure SMTP in the Super Admin panel or environment before testing real email/OTP delivery. No SMTP sender credentials or owner-approved legal text were supplied, so mail requires configuration and legal pages start as drafts.

Run `npm.cmd run check:cms` for isolated OTP, scorer and migration checks. Against a running local server, run `node scripts/check-cms-api.mjs`, `node scripts/check-backend.mjs`, `node scripts/check-authors-seo.mjs` and `node scripts/check-smtp-otp.mjs`. The SMTP integration check sends only to a local SMTP sink and restores settings afterwards. Browser regression checks require the existing Chrome debugging session on port 9222. Finish with `npm.cmd run build` before deployment.


This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in github.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables



Run the app: `npm run dev`

## Local admin and blog backend

Public website styles, layout, and content are preserved. The existing blog markup is connected to the local backend; articles are rendered on the server for indexing. Existing Firebase product functionality is left in place. Local blog posts are stored separately from any existing Firebase blogs.

Requires Node.js 24 (the backend uses the built-in SQLite module).

```powershell
npm.cmd install --legacy-peer-deps
npm.cmd run setup:admin
npm.cmd run dev -- --hostname 127.0.0.1
```

- Website: http://localhost:3000
- Admin sign-in: http://localhost:3000/login
- Blog management: http://localhost:3000/admin/blogs
- Local sign-in details: `.data/local-admin.txt` (excluded from Git)

The setup command does not overwrite an existing account. To rotate its password and revoke sessions, run `npm.cmd run setup:admin -- --reset`. You can set `ADMIN_USERNAME` and `ADMIN_PASSWORD` before setup to choose your credentials. Passwords are stored as salted scrypt hashes in the database. The local credential note is for your convenience and should be kept private.

Posts support drafts, authenticated previews, publication, editing, unpublishing, deletion, featured-image uploads, alt text, categories, authors, SEO titles, meta descriptions, canonical URLs, and per-post noindex. A changed slug creates a permanent redirect. Drafts do not appear in public APIs, pages, or sitemaps. HTML is sanitised on the server; use H2/H3 headings, paragraphs, links, and lists in the article editor.

Published articles include canonical links, Open Graph/Twitter tags, and BlogPosting/Breadcrumb structured data. `/sitemap.xml` includes indexable published articles. `/robots.txt` excludes admin and API paths. Metadata follows the [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata).

Data and uploads persist in `.data/website.sqlite` and `.data/uploads/`. Back up the entire `.data` directory with the server stopped. For future hosting, use a Node.js server with persistent writable storage; this backend cannot run as a static-only upload. Set `SITE_URL` to the exact public origin before deployment so canonical links and sitemap URLs use the domain. The current default is `http://localhost:3000`.

Validation against a running local server: `node scripts/check-backend.mjs`. This checks authentication, draft privacy, upload validation, publishing, server-rendered SEO, redirects, and deletion, then removes its temporary post.

## Rich text editor, authors, and SEO

Both Add Blog and Edit Blog use Quill with visual formatting, headings, lists, alignment, links, undo/redo, and an optional HTML source mode. The toolbar image button opens a Bootstrap-style upload dialog with required alt text and an optional caption. Pasted or dropped image files use the same upload flow. Featured and social-sharing images have separate upload controls. Image uploads accept JPG, PNG, and WebP up to 5 MB. Editor and upload styles are scoped so the public website layout is preserved.

Manage authors at `/admin/authors`. Create or edit profiles with a name, biography, expertise, photo, and website. Select an author in either blog form. Existing author names are migrated to profiles automatically without changing article content. Deactivated authors remain credited on existing posts; new assignments must use an active author. Authors assigned to posts cannot be deleted until the posts are reassigned.

The SEO form includes title and description, focus keyword checks, topic tags, canonical URL, noindex/nofollow, search preview, and Open Graph/Twitter title, description, and image overrides. Author profile details are included in article structured data.

Additional checks:

```powershell
node scripts/check-blog-migration.mjs
node scripts/check-authors-seo.mjs
node scripts/check-admin-ui.mjs
```

The browser check requires a local Chrome debugging session on port 9222 and the local app on port 3000. Checks create temporary records and remove them afterwards. Database backups and connector credentials are never included in Git.

For the intended Hostinger domain, set `SITE_URL=https://pakmoo.in` in the server environment, select Node.js 24, and keep `DATA_DIRECTORY` on persistent writable storage outside the deployment source directory. Use `npm ci --legacy-peer-deps`, `npm run build`, and `npm start`. Back up the existing database and uploads before deploying. Run `npm run setup:admin` on a new installation to create the initial admin account; existing accounts are preserved.

