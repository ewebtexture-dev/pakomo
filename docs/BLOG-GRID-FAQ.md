# Blog grid, reviewers and post FAQs

The blog listing uses the requested banner/intro/category-pill/card-grid/pagination structure in the existing PAKMOO components and colours. No reference text, logos or assets were copied. Header/footer and non-blog layouts are retained.

## Editing

- Pages → Blog listing: banner and breadcrumb, intro copy, image, reading/date/reviewer labels, posts per page (1–60; default 12), category/reviewer visibility and empty text. Existing page SEO/schema panels remain available.
- Site Settings → Reviewers: add/edit/delete profiles, then Save settings. Selecting a reviewer copies a snapshot into the post; later changes/removal do not silently change published articles.
- Blog → Add/Edit: plain-text summary up to 200 characters, optional reviewer fields, existing featured ImageField with filename slug/alt, content editor, then FAQs. Copy FAQs from another post or paste Q:/A: pairs. FAQ deletion requires confirmation; changes are applied when the post is saved/published.

## Compatibility and SEO

No destructive database migration or manual SQL is required. Optional metadata is stored in the existing post_extras draft/published JSON. Legacy excerpt/content fields remain available; existing summaries are derived without rewriting old rows. Missing reviewer defaults to none; missing FAQ data defaults to an empty list. Existing FAQs are preserved. Draft reviewer/FAQ changes remain private until published.

Published snapshots are filtered against the current time and sorted by publication timestamp. Pagination uses server-rendered ?page=N links, 12 posts by default, rel=prev/next links and self-canonicals for paginated pages. An explicit page-one canonical override is retained. Invalid/out-of-range page numbers are handled safely. CollectionPage, Blog and ItemList describe the visible results. Articles expose reviewedBy when provided and exactly one FAQPage node when active FAQ content exists. FAQ answers in schema are plain text; displayed answers use the shared sanitized rich-content component. There is no auto-generated table of contents in the current article template, so no new TOC was added.

## Verification

Regression coverage includes server-rendered cards, page two and canonical/prev/next links; summary fallback and validation; reviewers; future and draft visibility; FAQ zero/add/draft/publish/disable/delete, schema deduplication (including custom schemas), placement before related posts, SEO-score content and Q&A import. Browser checks cover 320/375/768/1024/1280px, equal card heights, cover images, keyboard accordion controls, reviewer selection, copy/import/reorder, confirmation and table actions. Temporary records and settings are restored after testing.

Run locally, with the production server and private local test credentials configured:

```powershell
npm.cmd run lint
npm.cmd run check:cms
$env:VIPS_CONCURRENCY='1'
$env:NODE_OPTIONS='--max-old-space-size=1536 --max-semi-space-size=8'
npm.cmd run build
# In a second terminal after npm start:
node scripts/check-blog-grid-faq.mjs
```

The regression script refuses non-local origins. Live deployment uses the existing Hostinger GitHub integration on main; persistent private SQLite data and uploads are retained.

## Changed files

| File | Change |
|---|---|
| `app/admin/(protected)/blogs/page.jsx` | Management table: image, title, category, date, status, reviewer and shared actions; deletion failures are propagated. |
| `app/api/admin/posts/[id]/route.js` | Revalidate after updates, unpublishing, revision restore and deletion. |
| `app/api/admin/posts/route.js` | Revalidate public routes after new posts are saved/published. |
| `app/api/admin/settings/route.js` | Validate and save the Reviewers settings scope. |
| `app/blog/category/[slug]/page.jsx` | Apply the same server grid, pagination, canonical and category filtering. |
| `app/blog/page.jsx` | Server-render the paginated listing and generate its canonical metadata. |
| `app/globals.css` | Scope plus/minus and smooth disclosure animation to post FAQs; respect reduced motion. |
| `src/cms/seo-score.js` | Include enabled FAQs in keyword/length analysis and add the FAQ-schema check. |
| `src/components/admin/ContentList.jsx` | Identify the blog page as Blog listing, including in search. |
| `src/components/admin/FaqEditor.jsx` | Post FAQ cards with rich answers, enable/disable, drag/keyboard ordering, shared actions, copy and bulk import. |
| `src/components/admin/PageContentForm.jsx` | Route the blog page to its new content form while retaining the existing SEO/schema panels. |
| `src/components/admin/PostEditor.jsx` | Summary counter, reviewer picker and per-post FAQs below the content editor; safe pending-upload handling. |
| `src/components/admin/SeoFields.jsx` | Use the new summary as the SEO-preview fallback. |
| `src/components/admin/SeoScoreChecker.jsx` | Recalculate when FAQs change and include FAQ text in readability. |
| `src/components/admin/SettingsPanel.jsx` | Add the Reviewers settings tab. |
| `src/components/blog/BlogArticle.jsx` | Place FAQs after the article content and before related-post markup; suppress duplicate FAQ scripts. |
| `src/components/blog/BlogListing.jsx` | Server-rendered 1/2/3-column cards, intro, category pills, reviewer/date/summary and crawlable pagination. |
| `src/components/shared/FaqSection.jsx` | Reuse the existing accordion with correct controlled aria-expanded state and optional schema emission. |
| `src/server/cms-seo.js` | Remove custom FAQPage nodes consistently, including array types, so post FAQs have one canonical source. |
| `src/server/content-validation.js` | Validate listing content controls without changing existing page SEO fields. |
| `src/server/posts.js` | Backward-compatible summary/reviewer/FAQ metadata and stable publish-date ordering. |
| `src/server/seo.js` | ReviewedBy Person and a single FAQPage node merged into the article graph. |
| `app/api/admin/reviewers/route.js` | Authenticated read endpoint for the saved-reviewer picker, including editor accounts. |
| `scripts/check-blog-grid-faq.mjs` | Local regression coverage with reversible fixtures and settings restoration. |
| `src/cms/blog-faq.js` | Safe plain-text Q&A import and FAQ content for SEO analysis. |
| `src/cms/blog-features.js` | Shared defaults and Zod schemas for listing controls and reviewers; pagination/date helpers. |
| `src/components/admin/BlogListingFields.jsx` | Dedicated Pages → Blog listing content controls, using the existing image picker. |
| `src/components/admin/ReviewerFields.jsx` | Optional reviewer name/role/profile inputs and saved-profile picker. |
| `src/components/admin/ReviewersManager.jsx` | Add/edit/delete saved reviewers with shared accessible actions. |
| `src/components/blog/BlogListingRefresh.jsx` | Refresh server-rendered listing data when returning to the tab or after CMS changes. |
| `src/server/blog-listing.js` | Published-only paged data, metadata and CollectionPage/Blog/ItemList JSON-LD. |
| `docs/BLOG-GRID-FAQ.md` | Implementation, editing, compatibility, validation and changed-file report. |
