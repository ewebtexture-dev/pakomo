# PAKMOO CMS: Phase 1 audit and approval specification

Date: 29 October 2026 (Asia/Calcutta). Proposed release/commit message: `2910`.
Baseline source commit: `7c2ee8d` (`anand2810`).

This is a proposal, not an implemented CMS. No application code, live data, accounts, or hosting settings were changed for this audit. The three supplied requirement files have identical SHA-256 hashes. Their final instruction is: **“Start with Phase 1 only: audit the project and show me the page-by-page field map and DB schema for approval.”** Implementation and release follow that approval.

## Evidence and current architecture

- Next.js App Router under `app/`, React components under `src/`, Tailwind classes and Framer Motion animations. Keep the existing public components, element hierarchy, classes, breakpoints and animation configuration.
- Existing SQLite backend: `src/server/database.js`, `auth.js`, `posts.js`, `authors.js`, `http.js`, `seo.js`. Tables: `admins`, `sessions`, `login_attempts`, `posts`, `authors`, `slug_redirects`. No database replacement is necessary.
- Products are currently read and written directly through Firebase Firestore/Storage in browser components. A read-only query returned **85 products**. Existing fields: `id`, `name`, `model`, `category`, `categoryLabel`, `desc`, `features`, `specs`, `maintenance`, `applications`, `faqs`, `conclusion`, `imageUrl`, plus migration/source identifiers. The unused/local catalogue has **87 items**; it must not overwrite the authoritative 85-record Firebase collection.
- Static collections: 4 category definitions, 10 applications with product-ID associations, 8 services and their individual routes, 8 standards, 10 client logos, 3 testimonials, 8 client-sector counters. The homepage has a separate 5-card service preview. Preserve those differences.
- Reuse `src/components/admin/RichTextEditor.jsx`: Quill 2, image upload dialog, required alt text, caption, paste/drop upload, HTML source and undo/redo. Its current toolbar does not provide table creation; extend this same editor to support tables rather than introducing a replacement editor. The existing HTML sanitizer already permits tables.
- Reuse the existing blog and author forms, authenticated API pattern, dark admin styling and UI controls. Existing blog SEO includes canonical, robots, social tags, author data, BlogPosting and breadcrumb JSON-LD; extend these rather than duplicating them.
- Login is `/login`; `/admin` is guarded by a server layout. API handlers call `requireAdmin` and enforce same-origin writes. Passwords use salted scrypt, sessions use opaque tokens in HTTP-only cookies, and login throttling is currently username-based. There are no email accounts, roles, OTPs or user-management modules yet. The session response currently supplies a hardcoded email rather than a stored admin email.
- Contact and quote forms currently call EmailJS from the browser; enquiries are not saved to the project database. Contact's subject is not included in its outgoing payload and its success state is immediately cleared. Replace the transport and fix those behaviors without changing form markup or styling.
- Uploads currently accept signature-checked JPG/PNG/WebP up to 5 MB and serve through `/media/[filename]`. There is no media index, image processing, PDF upload or cloud-storage adapter.
- Non-blog pages largely inherit the same root title and description. The sitemap lists main pages and blog posts, but not product, service-detail or application-detail URLs. No redirect manager, global SEO settings, revision history or enquiry inbox exists.
- No `AGENTS.md` was found in the workspace. Working tree was clean before audit documents were created.

### Live route checks

HTTP GET checks on `https://pakmoo.in` on 29 October 2026 confirmed 200 responses for all ten main pages, all eight service detail pages, all ten application detail pages, and three representative Firebase product URLs. Server HTML headings were compared with the source inventory. The web reader could not access the domain, so direct HTTPS requests supplied this evidence instead.

`/privacy-policy`, `/terms-of-service`, `/privacy` and `/terms` return 404. Footer legal links currently point to `#`. These are new pages, not existing content that can be imported. Seed them as drafts, retain the present footer appearance, and publish only owner-supplied legal text. A product route returning 200 does not prove its Firebase content renders: current product data loads after hydration, so browser verification remains a later acceptance check.

See [live route evidence](live-route-checks.json) and [source content inventory](content-inventory.json). The inventory records 47 source files, exact literal defaults, asset imports, source lines and data-binding expressions. It includes unused preview/catalogue sources explicitly for migration classification; those are not a seed authority. API secrets, private database contents, password hashes and environment values are excluded.

## Field conventions

Each page gets its own form with the sections below, not a generic JSON editor. Shared field components are reusable; each page's field definition and validation remain specific to that page.

| Type | Editor and validation |
| --- | --- |
| Text | Required when currently displayed; generally 160 characters for headings, 250 for short descriptions, 80 for labels. Store full existing values before enforcing new limits; report legacy exceptions rather than truncating them. |
| Rich text | Existing Quill component, HTML source, links, images and table support. Maximum 200,000 characters; sanitize at write and render boundaries. Keep current typography and paragraph structure when seeding. |
| Image | Existing asset or media picker/upload, preview, alt text, focal metadata, intrinsic dimensions. Validate actual image format, decode/re-encode and optimize new uploads. Existing assets keep their current rendered geometry. |
| Link | Label, URL, internal-page picker, action (`navigate`, `quote`, `call`, `whatsapp`), new-tab toggle. Permit internal paths and appropriate HTTPS/mailto/tel destinations; reject script URLs. Existing quote buttons must retain their modal action. |
| Repeater | Stable item ID, enabled flag, sort order, add/remove/drag controls; validate each child's type and preserve seeded order. Icons use an allowlisted icon ID, not executable JSX. |
| Reference | Validated IDs from the relevant collection, selectable in the admin; retain legacy IDs/slugs and ordering. |

Every editable page/collection record receives draft and published snapshots, last editor/date, a conflict-detection version and the last 10 revisions. Editing a draft of a published page must not alter its public content. Restore creates a new draft; publishing it is explicit. Site settings and menus also get revisions and audit events.

### Common page header and interface labels

Where `PageHeader` is present: title, subtitle, background image/alt, breadcrumb items (`label`, `href`) and Home breadcrumb label. Route-specific text belongs to that page form. Also expose each page's existing button labels, empty-state messages, search placeholders, count suffixes, card labels and tooltips. Structural classes, animation settings and CSS colors are not content fields.

## Page-by-page field map

### Home `/` — `app/page.jsx`, `src/components/home/*`

| Collapsible section | Fields and existing seed |
| --- | --- |
| Hero | `tagline` = “40+ Years of Precision Engineering”; heading segments (`prefix`, `highlight`, `suffix`) preserving the current line breaks/highlight span; introductory text segments and emphasized “445+ industries”; background image and alt; primary link “Explore Products” → `/products`; secondary “Request a Quote” → existing modal; scroll label. |
| Compliance badges | Ordered 4-item label list: ISO 9001:2015, ASTM Compliant, BIS Certified, NABL Traceable. |
| Hero statistics | Ordered `{value,label,subLabel}` rows: 200+/Products/Testing instruments; 445+/Industries/Served globally; 525+/Applications/Across sectors; 40+/Years/Of excellence. Preserve the existing card presentation. |
| Counters strip | `{icon,value,suffix,label,subLabel}`: 100% Client Satisfaction; 445+ Industries Served; 525+ Applications; 200+ Products. Retain current animation behavior and exact descriptive text. |
| Featured instruments | Tag “Product Catalog”, heading “Featured Instruments”, description, View All Products link, ordered category references/tab labels, ordered selected product references, card “View Details” label and existing badge text. Seed selection/order from current Firebase output, not the unused 12-product fallback array. |
| Why Industries Choose Us | Tag, heading, description, background image/alt and 6 `{icon,title,richDescription}` cards: High Accuracy, Standards Compliance, Advanced Technology, Expert Support, Durable Equipment, Custom Solutions. |
| Global Testing Standards | Tag “Compliance”, heading, description, ordered standard references with preview name/count/logo overrides. Keep duplicated ticker tracks as rendering logic; seed only 8 logical standards. |
| Our Services | Tag “What We Offer”, heading, description, All Services link, current 5 preview cards `{icon,title,richDescription,image,alt,link}`. Preserve titles and text separately from the service index where currently different. |
| Our Happy Clients | Tag “Trusted By”, heading, description, 10 ordered client references with existing logos/names; testimonial references with quote, person, designation, company and rating. Preserve current rotation behavior. |
| CTA banner | Tag “Get Started Today”, split heading, description, background image/alt, Request a Free Quote action, Call Us Now phone action. |
| Blog preview | Tag “Latest Insights”, heading “From Our Blog”, description, All Articles link, Read more label, post count and ordering. Seed the current behavior (all published posts) rather than silently limiting the visible feed. |
| Standards strip | Footer “Global Standards Compliance” label and ordered badge names are global footer settings, not a duplicate homepage collection. |

`ApplicationsPreview` is commented out in `app/page.jsx`. Keep it disabled. Its dormant content can be preserved in a disabled section; do not add a new visible homepage block during conversion.

### About `/about` — `app/about/page.jsx`

- Header: current About Us title, subtitle, breadcrumbs and background image.
- Who We Are: tag, “Precision in Every Instrument” heading, three rich-text paragraph blocks; facility image/alt; overlay statistic value `10+` and label “Years of Excellence”. Preserve paragraph classes and spacing.
- Mission and Vision: two ordered `{icon,title,richDescription}` cards.
- Our Journey: tag, “Company History” heading; four `{year,title,richDescription}` timeline entries, keeping the 2025/2026 values and current order.
- Our Strengths: tag, “Manufacturing Expertise” heading; four `{icon,title,richDescription}` cards, retaining current engineering/team/facility/quality claims exactly as written.

### Products `/products` — `app/products/page.jsx`

- Header: title “Our Products”, subtitle, breadcrumbs and existing image/default.
- Catalogue controls: search placeholder, Categories label, All Products tab label, ordered category references, instrument count label and empty/loading copy where present.
- Cards: product references; card names/images/alt/model/specification snippets come from each product record. Existing design settings remain in code.
- Existing product modal: editable Technical Specifications, Features, Request Quote, Close and View Full Detail labels; product content comes from the same record as the detail page.
- Categories: seed the exact legacy keys `paper&packaging`, `plastic&polymer`, `polyFilms`, `paint&plastic`; add separate clean slugs without breaking these legacy relationships. New category URLs, if enabled, reuse the product listing presentation.

### Product detail `/products/[details]` — existing component and `FAQ.jsx`

Dedicated product form sections:

1. Identity: name, existing slug/ID, model/SKU, category multi-select and card category label, short description, full rich description, featured toggle, price-on-request toggle and quote prefill text. Do not invent prices.
2. Media: existing primary `imageUrl`/alt, gallery `{mediaId,alt,caption,order}`, brochure PDF and label. Initial gallery contains the existing image; additional assets remain optional and must not add empty public blocks.
3. Technical specifications: ordered `{label,value,unit?}` table rows, preserving existing key/value order.
4. Key Features: ordered rich-text items.
5. Maintenance Tips: ordered rich-text items (an existing section missing from the request's sample product schema).
6. Applications: ordered display text plus application references; standards multi-select; related product references.
7. Conclusion: existing text, promoted to rich text with the same public typography.
8. FAQ: ordered `{question,richAnswer}` items; current FAQ tag/heading/intro.
9. Page labels/actions: breadcrumbs, Request a Quote, Call Us, Technical Specifications, Back to all products, Key Features, Maintenance Tips, Applications, CTA heading/body/buttons, Conclusion, missing-product message/back link.
10. SEO and Schema tabs described below.

### Applications `/applications` and `/applications/[application]`

- Index header: title, subtitle, breadcrumb and background image/alt; Key Tests and View Instruments labels.
- Application collection: name, current ID/slug, icon, rich description, instrument-count display string, key-tests text/ordered list, image/alt and ordered product references. Seed all 10 objects from `app/applications/applicationData.js`; keep product association IDs intact.
- Each detail: header title/description/image/breadcrumbs from the application; Request a Quote action; product search placeholder, count and empty-state text; product cards reference the product collection.
- Specialized Solutions panel: current tag “Why Choose Pakmo”, heading prefix and application name, six ordered support/benefit strings. Preserve the present wording; do not silently rename it.
- Back to Applications/Back to All Applications labels and links; application-not-found title/subtitle/link.

### Services `/services` and all eight details

- Index header: Our Services title, subtitle, breadcrumb and background image/alt.
- Index cards: ordered service references with `{title,richExcerpt,image,alt,link}`; Get Service Quote label/action.
- Detail form: header title/subtitle/background image/alt/breadcrumbs, content image/alt, body heading, current rich-text paragraph block(s), Get Service Quote action.
- Separate route-specific forms/content for `/services/manufacture`, `/calibration`, `/maintenance`, `/documentation`, `/instrument`, `/support`, `/installation`, `/consultation` beneath `/services`. Keep existing URLs even when the display title differs.
- Homepage service preview overrides remain independent where its five cards differ from the eight service records.

### Testing Standards `/testing-standards`

- Header: title, subtitle, breadcrumb and background image/alt.
- Ordered standards selector/card references.
- Standard fields: code, full name, country, logo/alt, rich description, tests-count display, ordered `{code,title,richDescription?}` supported methods.
- Expanded detail: Supported Test Methods label and missing-image message. Preserve selection/scroll behavior.
- Seed ASTM, ISO, BIS, TAPPI, DIN, ISTA, JIS, GeM; preserve separate homepage short names/count text and footer badges. ISTA currently contains IEC-related description/methods. Flag this for editorial correction after import rather than altering it during the visual-preservation migration.

### Clients `/clients`

- Header: Our Clients title, subtitle, breadcrumbs and background image/alt.
- Trusted By: tag, Our Valued Clients heading, ordered client selections.
- Client form: company name, logo/alt, website/link if provided, industry references and enabled/order controls.
- Sectors: tag, Industries Served heading; eight `{industryName,count,suffix,label}` rows, with “Companies served” label.
- Testimonials: tag, What Our Clients Say heading, ordered testimonial references. Testimonial form: quote/rich text, person, designation, company/client relation, rating and optional avatar. Seed all three current quotes exactly. Preserve quotation styling and navigation.

### Why Us `/why-choose-us`

- Header: current title/subtitle/image/alt/breadcrumbs.
- Six strength cards `{icon,title,richDescription}`.
- Quality Assurance: tag, Our Quality Process heading, five `{step,title,richDescription}` entries.
- Capabilities: tag, Manufacturing Scale heading, four `{value,unit,label}` entries.
- Get a Custom Quote button text/action.

### Blog `/blog` and `/blog/[details]`

- Listing settings: Blog & Insights title, intro, header image/alt, breadcrumb label, article-count label, Read More label, date/read-time labels; existing article selection and order.
- Article: reuse title, slug, category, excerpt, body editor, author selection, featured image/alt, publish status/date and existing SEO fields. Add revisions, extended SEO/schema, last editor, permissions and conflict detection.
- Article interface: breadcrumb labels, Pakmoo Blogs label, Back to all articles, Related Articles heading/count, Article not found and Back to Blog labels.
- Reuse the existing author module; extend only if needed. Do not turn authors into admin login accounts.
- Blog search/category sidebar is commented out. Preserve its disabled state rather than showing a new public control.

### Contact `/contact`

- Header: Contact Us title/subtitle/breadcrumbs.
- Banner: current office image/alt; lower team image/alt.
- Information: Get In Touch tag, Contact Information heading, intro; four contact-card labels/icons. Values use global contact settings (address, phone, email, business hours).
- WhatsApp panel: heading, helper text; global number/message generate its destination.
- Message form: heading, 24-hour response copy, name/email/phone/subject/message labels/placeholders, send label, success heading/body and failure copy. Keep current required fields and layout, validate again on the backend.
- Location: map embed URL, iframe title, team image. Restrict embeds to approved Google Maps URLs. Do not generate arbitrary iframe HTML from admin text.

### Privacy Policy and Terms of Service (new)

Proposed `/privacy-policy` and `/terms-of-service`: dedicated title, intro, effective date, optional last-reviewed date, rich body, contact reference, SEO and WebPage schema. There is no current body text to seed. Create drafts and request approved text before publication; link existing footer labels to these routes only once published. Use existing page/container typography for the new content.

## Global settings and modules

| Module/form | Fields |
| --- | --- |
| Header | Existing logo/alt/intrinsic size/display height, brand “PAKMOO”, tagline “Testing Instruments”, home link, main-menu reference, desktop/mobile Request a Quote text/action. Seed the same sizes; no redesign. |
| Menus | Named header, footer Quick Links and Products menus. Each item: stable ID, parent ID, label, destination/action, target, enabled, position. Seed 10 header, 6 quick and 5 product links. Validate no cycles/depth overflow. New submenu content can be configured, but seeded output stays flat. |
| Footer | Logo/alt/name/tagline, current about copy, standards label/badges, section headings, menu references, stay-updated text, newsletter toggle (off: input is currently commented out), social platform/URL/icon list, copyright template with current year, legal link labels/destinations. |
| Contact | Structured address, displayed address, ordered `{number,display}` phones, ordered emails, WhatsApp number/message, hours/timezone, map URL. Feed footer, contact, product call links, CTA call links, mobile bar and organization schema from one source. Seed both existing phone numbers. |
| Quote modal | Existing heading/description, all labels/placeholders, industry choices, product interest/prefill, submit/success/error text; backend form field rules. Every current quote button still opens this modal. |
| Enquiry delivery | Receivers/CC/BCC, subject template, auto-reply flag/message, from name/address, SMTP host/port/TLS/user/password, test recipient and Send test email. SMTP secrets encrypted at rest with a server-only environment key; masked fields never round-trip as replacement secrets. |
| Enquiry inbox | Saved sender/contact/company/industry/product/subject/message/source page, delivery status, New/In progress/Closed, read time, notes, assigned admin, CSV export and delete. Save first, queue email, show retry/failure status; neutralize spreadsheet formulas on CSV export. |
| Media | Upload/browse/search, filename/type/size/dimensions/alt/caption, usage links, safe deletion, image variants and PDF metadata. Local persistent storage first; configurable S3/Cloudinary adapters. Do not delete media still referenced by published content. |
| SEO & redirects | Global title template, site name/default description/OG image, verification codes, indexing/sitemap controls, redirects `{from,to,status301or302,enabled}`; validate loops, reserved routes and safe targets. |
| Organization schema | Legal/trading name, logo, URL, address, contact, geo, opening hours, social `sameAs`, organization/local-business type, website search template. Do not emit SearchAction without a working search destination. |
| Scripts & extras | GA ID, GTM ID, scoped custom head/body script slots, optional custom CSS, favicon, maintenance toggle. Super Admin only; intentional scripts separate from rich-text sanitization and excluded from public settings JSON. Maintenance defaults off; admin/login/reset remain accessible. |
| Users/Profile | Super Admin/Editor, stored email, display name, active flag, password update, account email update with current password + OTP. Seed existing primary admin with `juhityagi09@gmail.com`, keep its username and password usable. Account defaults from `ADMIN_RESET_EMAIL`, then database settings are authoritative. |

## SEO, score and schema contract

Every Page, Product, Category, Application, Standard, Client/Service public record, and BlogPost has an SEO tab:

`focusKeyword`, `relatedKeywords[]`, `title`, `metaDescription`, `slug`, `canonicalUrl`, `noindex`, `nofollow`, `ogTitle`, `ogDescription`, `ogImage`, `twitterTitle`, `twitterDescription`, `twitterImage`, `twitterCard`, `breadcrumbTitle`, `includeInSitemap` and optional sitemap priority/change frequency. Published records only drive metadata, canonical links, sitemap and schema. Slug changes maintain redirects; published paths remain separate from draft slugs until publish.

Reuse/extend `SeoFields` and server metadata helpers. Add debounced, pure `analyzeSeo()` and `analyzeReadability()` utilities consumed by `SeoScoreChecker`. Show per-check evidence, a specific fix, 0–100 scores, traffic lights, pixel/character counters and desktop/mobile snippets. Check keyword placement, density, body length, alt text, H1 count (including the template H1), links, duplicate keywords, title/description lengths and slug quality. Readability adds Flesch, sentence/paragraph length, approximate passive-voice and transition checks, repeated sentence starts and heading distribution. Explain heuristic estimates; scores do not guarantee ranking. Normalize Unicode and strip HTML before analysis. Duplicate checks run through an authenticated endpoint and exclude the current record.

Schema tab: type plus guided fields for WebPage, AboutPage, ContactPage, CollectionPage, Article/BlogPosting, Product, Service, FAQPage, BreadcrumbList, Organization, LocalBusiness, HowTo and VideoObject. Common inputs: name, description, images, URL and breadcrumbs. Product adds SKU/brand/offer currency/price/availability and real rating data; FAQ adds question/answer pairs; HowTo adds ordered steps; Video adds thumbnail/upload date/content/embed URL/duration. Advanced JSON must parse and pass size/depth/type validation; merge by stable `@id` with global schema, escape `<` in serialized JSON-LD, and provide the Google Rich Results test link. Leave unsupported commercial claims/rating/price fields absent rather than inventing data.

## Proposed database schema

Keep SQLite because it already exists. Extend it transactionally and retain existing blog IDs, author relations, passwords and sessions. Firebase products migrate once into this backend after a verified export; switch reads/writes together so there is one source of truth. No Firebase deletion is part of this proposal.

Shared storage does not imply a generic editing form: each `kind` has its own Zod payload schema and dedicated page/collection form. JSON holds naturally nested section/repeater data; relational tables hold identities, relationships, security state and operational records.

| Table/model | Proposed columns and rules |
| --- | --- |
| `schema_migrations` | version PK, applied_at; run idempotent migrations and take a pre-migration backup. |
| `content_records` | id UUID PK, kind (page/product/category/application/standard/client/testimonial/service), stable key unique per kind, draft_slug, published_slug, draft_json, published_json nullable, draft_seo_json, published_seo_json, draft_schema_json, published_schema_json, status, enabled, sort_order, published_at, created_at/by, updated_at/by, version. JSON validity checks, unique published paths, index kind/status/order. Payload fields are precisely the page/collection maps above. |
| Page model | `kind=page`, stable keys home/about/products/applications/services/testing-standards/clients/why-choose-us/blog/contact/privacy-policy/terms-of-service; payload `sections` uses the page's own schema. |
| Product model | `kind=product`; payload identity, descriptions, features, specifications, maintenance, media/gallery/PDF, quote settings, conclusion/FAQ, source Firebase ID. Preserve legacy slug and raw source metadata for migration traceability. |
| Category/Application/Standard/Client/Testimonial/Service models | Separate typed schemas on `content_records`; exact fields above; unique slug in appropriate namespace. No public route is invented for a logo/testimonial without an existing template. |
| `content_links` | from_id FK content_records, to_id FK content_records, relation (product-category/product-standard/application-product/related-product/client-testimonial), stage (draft/published), position, unique combination. Reject incompatible kinds, self-links where inappropriate and dangling targets. Publish links atomically with their parent. |
| Existing `posts` | Preserve columns and add draft/published snapshots, extended SEO/schema, created_by/updated_by, optimistic version and staged slug handling. Existing public rows initialize both snapshots without changing content; current serializers continue until switched. |
| Existing `authors`, `slug_redirects` | Preserve data and IDs. Extend audit/version fields as needed; import blog redirects into the shared manager while keeping compatibility. |
| `content_revisions` | id, entity_type, entity_id, version, snapshot_json, actor_id FK admins, action, created_at. Keep latest 10 per entity; record publish and restore. Restoring does not erase audit history. |
| `site_settings` | scope PK (header/footer/contact/enquiry/seo/schema/scripts/account), value_json, version, updated_by/at. Public serializers allowlist fields. SMTP secrets live separately, never in public JSON or ordinary revisions. |
| `menus` / `menu_items` | menu ID/key/name/version; item ID/menu FK/parent FK/label/url/action/target/enabled/position. Publish menu trees as a validated atomic snapshot. |
| `enquiries` | id, name/email/phone/company/industry/product_id/subject/message/source_url, status, read_at, assigned_to, created_at/updated_at. Search/status/date indexes. |
| `enquiry_notes` | id, enquiry_id FK, author_id FK admins, note, created_at. |
| `email_jobs` | id, type, enquiry_id optional, recipient metadata, template/payload, status, attempts, next_attempt_at, last_error, sent_at. OTP payloads encrypted with short retention; never log OTPs or SMTP passwords. |
| `smtp_secrets` | id/scope, ciphertext, IV/nonce and authentication tag, key_version, updated_by/at. Encryption master key in environment only, encrypted backup/rotation procedure. |
| Existing `admins` (AdminUser) | Add normalized unique email, display_name, role super_admin/editor, active, hash_scheme, email_verified_at, reset_email_verified_at, updated_at. Existing scrypt accounts continue working; rehash to Argon2id on successful login/password change. Do not invalidate the current password just for a migration. |
| Existing `sessions` | Retain hashed opaque tokens; add created_at, last_seen_at and optional session version for revocation. Use role/user data from DB on every protected action. |
| `otp_tokens` | id, admin_id, purpose reset/email-change, email_digest, code_hmac, nonce, expires_at, attempts, consumed_at, resend_after, created_at. Six-digit crypto-random code, keyed hash with server secret, 10-minute expiry, max 5 failures, single-use atomic consume. |
| `rate_limit_buckets` | key_hash PK, category, counter, window_end; keyed IP/email buckets, expiry cleanup. Do not trust arbitrary forwarded IP headers. Keep/extend existing login_attempts during migration. |
| `password_reset_grants` | token_hash PK, admin_id, otp_id, expires_at, consumed_at. Short-lived single-use grant after OTP verification, consumed with password update/session revocation in one transaction. |
| `redirects` | id, from_path UNIQUE, to_url, status 301/302, enabled, created_by/at, updated_by/at. Index from_path/enabled; prevent loops and protecting/API-route overrides. |
| `audit_logs` | id, actor_id, action, entity_type/id, redacted changed-fields JSON, created_at. Never store passwords, OTPs, session tokens or SMTP credentials. |
| `media` / `media_usages` | media ID/provider/storage_key/public_url/original_name/MIME/bytes/dimensions/alt/caption/variants_json/created_by/at; usage entity/type/field/stage FK media. Check both draft and published references before deletion. |

### Auth/API and runtime decisions

- Add `/admin/login` as an auth-exempt login route; preserve `/login` compatibility. Move the admin guard into a protected route group so the new login/reset pages cannot redirect recursively. Add middleware coarse gating for admin/API routes, but keep authoritative DB authorization in handlers/layouts. The current default middleware runtime must not import `node:sqlite`.
- Keep HTTP-only Secure SameSite cookies; check CSRF/origin on mutations; validate all payloads with Zod. Editors may manage content/media/enquiries as permitted; settings/users/scripts remain Super Admin only. Public read endpoints return published fields only.
- OTP request/resend returns the same generic result for existing/non-existing emails. Queue sending to reduce response-timing differences; enforce email/IP limits and the 60-second resend cooldown. Verify the OTP, issue a short-lived reset grant, then atomically update the password and revoke sessions. Send a password-change notice. Account email change requires current password and OTP sent to the current verified address; verify the new address before final activation.
- SMTP delivery is an external dependency. No SMTP credential was supplied in these attachments. Configure a real sender and test approved delivery before claiming OTP works. Do not send test mail during the audit. The supplied default reset address does not prove mailbox verification.
- Public server components fetch published data and pass props to the current client presentation components. Use tagged cache/ISR where suitable; `revalidatePath`/`revalidateTag` after save/publish/restore. Draft saves never invalidate a published snapshot into draft content.
- Redirect middleware calls a narrowly scoped redirect-resolution endpoint/cache and fails open on lookup failure; do not expose raw database access to an incompatible middleware runtime. Reserve auth/API/static paths.

## Data persistence, seeding and release gate

The live database last inspected on 28 October was inside the active deployment at `/home/u835816219/domains/pakmoo.in/hbuilds/current/nodejs/.data/website.sqlite`; uploads use that same data directory. This location is deployment-dependent. **Move data before deploying the CMS.** Proposed stable private path: `/home/u835816219/domains/pakmoo.in/private-data` with `DATA_DIRECTORY` pointing there. Confirm Hostinger permissions first. This path is outside public_html and hbuilds versions.

Before any code deployment: obtain a consistent SQLite backup (including live WAL changes through the backup API or a maintenance window), copy uploads, validate row/media counts and SQLite integrity, switch the runtime to stable data storage, restart and verify login/content, and test a deployment/restart without data loss. Preserve an immediate rollback copy. Never run destructive reseeding or reset the live admin during release. Hostinger's environment update is full replacement, so preserve all existing real settings rather than submitting masked values. Align the live runtime with the repository's Node 24 engine before relying on newer SQLite/crypto APIs.

Seed behavior:

1. Import exact current page strings, section order and asset references from this source baseline; archive the current live HTML and capture browser screenshots before modifying bindings.
2. Export the 85 authoritative Firebase records and record IDs/counts/checksums. Convert product references and image URLs without renaming current routes. Reconcile the 87-item local catalogue separately; do not auto-add missing entries.
3. Seed pages, typed collections, menus and settings only when their stable keys are absent. Never overwrite later admin edits on a second run. Store a seed version/migration map.
4. Retain independent text variants (home versus inner pages) rather than normalizing descriptions/claims during import. Existing About/hero/Why Us experience claims conflict; preserve them and flag for later editorial review.
5. Use bundled defaults if a page has not yet been seeded; when an existing page has a published snapshot, that snapshot is authoritative. Missing optional blocks do not become new public sections. New legal pages remain unpublished.

## Phased implementation and acceptance

| Phase | Deliverable and required checks |
| --- | --- |
| 1 — this delivery | Source/live audit, exact-value inventory, field map, proposed schema and migration/release plan. Await approval. |
| 2 | Non-destructive account migration, roles/protected admin shell, OTP/reset/profile and SMTP configuration. Unit-test expiry, resend, max attempts, concurrency/single use, enumeration/rate limits, roles and session invalidation. |
| 3 | Global settings/menus/contact bindings and enquiry API/inbox/email queue. Test save-before-email, delivery errors/retries, CSRF, secret redaction and existing quote prefill flows. |
| 4 | Dedicated page forms, revisions/restore and idempotent seeds. Compare baseline screenshots on desktop/mobile with animations settled and fonts/assets/data matched; assert unchanged classes/component hierarchy and no draft leakage. |
| 5 | All typed collection forms/search/filter/pagination/bulk/reorder; migrate Firebase products and preserve URLs/relations. Test malformed references, duplicates, ordering, media usage and idempotent import. |
| 6 | Reusable SEO/scoring/schema panels, metadata, robots/sitemap/redirect management. Unit-test the pure scorer and edge cases; inspect server HTML, canonical/indexing exclusions, escaped JSON-LD, redirect loops and published-only output. |
| 7 | Full production build, existing regression checks plus new security/visual/persistence checks; updated environment example, setup/deployment README, admin guide and recovery/backup instructions. Release only after SMTP and data persistence acceptance. |

After the approved implementation is complete and validated, use Git commit message **`2910`**, push to `ewebtexture-dev/pakomo`, monitor the Hostinger deployment for **pakmoo.in**, and verify public routes, admin login, records/uploads, enquiry delivery and metadata on the live build. If GitHub main auto-deploys, the data backup/persistence gate must happen before that push. This audit does not create that application release or trigger a live build.

## Approval requested

Approve this field map and the proposal to extend existing SQLite, migrate the authoritative Firebase products without deleting Firebase data, and move live data outside deployment directories. Then proceed through Phases 2–7 and release `2910`. SMTP sender credentials and owner-approved legal text are the remaining external inputs; neither should be guessed or committed to Git.
