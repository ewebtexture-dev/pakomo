
**About**


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

