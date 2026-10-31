# Release 3110:01

Version: 1.0.311001.

## Findings

Deletion routes existed. The seed bootstrap recreated deleted default records on each new server process, and the root client CMS context retained old category/page data. A persistent seed ledger now prevents resurrection. Public CMS data refreshes on navigation/focus, with no-store responses; mutations revalidate the root layout. Referenced records are blocked with a clear conflict message. Core pages are unpublished rather than deleted; admin users with audit/content history must be deactivated.

The reported universal backend save failure did not reproduce: all 25 original page updates and sampled collections returned 200 before the changes. Stale client snapshots and the distinction between draft and published content obscured successful saves. Validation previously returned a joined message without field mappings. Forms now show structured field errors and mutation notifications. Blog page metadata previously overrode CMS SEO with hardcoded values; it now reads CMS metadata.

Additional reproduced save defects: redirect GET responses used integer enabled flags while POST required booleans; editing a redirect source did not update its existing ID; admin username edits were ignored. These are corrected. New blog defaults are now initialized from the fetched category collection so deleted default categories cannot remain selected invisibly. Status toggles preserve drafts.

## Features

- Shared accessible edit/delete/preview/status/duplicate controls, confirmation, pending state and notifications. Repeater/menu/social items use the same actions.
- Standards logos accept uploaded URL strings and imported image objects. All 25 pages fit in the page list; search includes page keys.
- Plain testimonial textarea, sanitized legacy quotes and entities, clean SEO text. Rich descriptions and answers retain safe HTML. Empty testimonial collections do not crash the page.
- Gallery albums, covers, location/subtitle, multi-upload WebP progress, per-image title/alt/order/status/schedule, responsive card grid, detail routes and keyboard/swipe fullscreen viewer. Existing single-image records remain compatible. Draft/future images are excluded from public responses.
- Gallery page content and page SEO are separate from albums, which have no SEO fields. Gallery menu entry is managed under Menus; empty gallery is hidden from navigation/home.
- Contact map embed extraction/validation, map link, latitude/longitude, admin preview and shared public map. Location schema uses the same coordinates and map link.
- Shared image picker with preview, slug, alt, replace/remove and size guidance. Uploaded names use readable unique numeric suffixes. Renaming rewrites CMS/post/author/settings/revision references and stores aliases so old URLs keep working.

## Automatic migrations

No manual SQL required. On first use, the server creates private pre-311001-backup.sqlite before the text migration, adds cms_seed_ledger and media_aliases, cleans quote/metadata text, and adds the Gallery menu item once. Existing SQLite database, uploads, credentials and server environment remain persistent. Migration tests verify idempotence, nested quote-form preservation, decoded text and database integrity. Never upload the private database or environment files to GitHub/Firebase public Storage.

## Public editing map

| Page | Sections | Admin location |
|---|---|---|
| home | Hero, Counters strip, Featured Instruments, Why Industries Choose Us, Global Testing Standards, Our Services, Our Happy Clients & Testimonials, CTA banner, Blog preview | Pages → home; related cards in collections |
| about | About Us | Pages → about; related cards in collections |
| products | Products catalogue | Pages → products; related cards in collections |
| product-template | Product detail labels, Product FAQ labels | Pages → product-template; related cards in collections |
| applications | Applications listing | Pages → applications; related cards in collections |
| application-template | Application detail labels | Pages → application-template; related cards in collections |
| services | Services listing | Pages → services; related cards in collections |
| testing-standards | Testing standards | Pages → testing-standards; related cards in collections |
| clients | Clients & testimonials | Pages → clients; related cards in collections |
| why-choose-us | Why Choose Us | Pages → why-choose-us; related cards in collections |
| blog | Blog listing | Pages → blog; related cards in collections |
| blog-template | Article labels | Pages → blog-template; related cards in collections |
| contact | Contact Us | Pages → contact; related cards in collections |
| global | Header & navigation, Footer, Quote modal, Mobile enquiry bar, WhatsApp button, Breadcrumb labels | Pages → global; related cards in collections |
| service-manufacture | manufacture service | Pages → service-manufacture; related cards in collections |
| service-calibration | calibration service | Pages → service-calibration; related cards in collections |
| service-maintenance | maintenance service | Pages → service-maintenance; related cards in collections |
| service-documentation | documentation service | Pages → service-documentation; related cards in collections |
| service-instrument | instrument service | Pages → service-instrument; related cards in collections |
| service-support | support service | Pages → service-support; related cards in collections |
| service-installation | installation service | Pages → service-installation; related cards in collections |
| service-consultation | consultation service | Pages → service-consultation; related cards in collections |
| Gallery | Header, grid copy, albums/images, page SEO | Pages → Gallery; Gallery albums; Menus |
| Product/application/service detail | Content, images, relationships, FAQs, metadata | Corresponding collection + template page |
| Contact map and details | Address, phone, email, hours, map, directions | Site Settings → Contact |

## Validation

Browser delete and edit/publish checks passed. API and browser regression scripts are scripts/check-release-311001.mjs and the release verification report. Run npm run lint, npm run check:cms, node scripts/check-migration-311001.mjs and node scripts/check-release-311001.mjs against the local production server. Full-project checkJs has existing JavaScript/dependency typing failures; this is distinct from Next production compilation and ESLint, and must not be reported as a clean full TypeScript check.

## Firebase status

New project configuration is pakmoo-bd1d6; 85 product documents were previously copied and verified. 116 old Storage files are backed up privately. At the last access check, source project access returned 403 and destination billing was disabled with no Storage bucket. Full project audit/file cutover and old-account disconnection require those prerequisites. No old project data was deleted and no paid billing upgrade was performed.

## Changed files

- app/admin/(protected)/authors/page.jsx
- app/admin/(protected)/blogs/page.jsx
- app/admin/(protected)/catalog/[collection]/[id]/page.jsx
- app/api/admin/media/route.js
- app/api/admin/settings/route.js
- app/api/admin/uploads/route.js
- app/api/admin/users/route.js
- app/api/public/content/route.js
- app/blog/page.jsx
- app/clients/page.jsx
- app/contact/page.jsx
- app/media/[filename]/route.js
- app/sitemap.js
- app/testing-standards/page.jsx
- next.config.js
- package-lock.json
- package.json
- src/components/admin/AdminShell.jsx
- src/components/admin/AuthorEditor.jsx
- src/components/admin/CmsField.jsx
- src/components/admin/ContentEditor.jsx
- src/components/admin/ContentList.jsx
- src/components/admin/EnquiryInbox.jsx
- src/components/admin/FirebaseSettings.jsx
- src/components/admin/GalleryManager.jsx
- src/components/admin/MediaLibrary.jsx
- src/components/admin/PageContentForm.jsx
- src/components/admin/PasswordReset.jsx
- src/components/admin/PostEditor.jsx
- src/components/admin/PostRevisions.jsx
- src/components/admin/ProfilePanel.jsx
- src/components/admin/RedirectManager.jsx
- src/components/admin/RichTextEditor.jsx
- src/components/admin/SeoFields.jsx
- src/components/admin/SeoPanel.jsx
- src/components/admin/SettingsPanel.jsx
- src/components/admin/UsersPanel.jsx
- src/components/blog/BlogListing.jsx
- src/components/cms/ContentProvider.jsx
- src/components/gallery/GallerySection.jsx
- src/components/home/ClientsPreview.jsx
- src/components/layout/Navbar.jsx
- src/components/shared/SafeImage.jsx
- src/server/bootstrap.js
- src/server/cms-migrations.js
- src/server/cms-seo.js
- src/server/cms.js
- src/server/content-validation.js
- src/server/http.js
- src/server/posts.js
- app/gallery/[slug]/page.jsx
- scripts/check-migration-311001.mjs
- scripts/check-release-311001.mjs
- src/cms/gallery.js
- src/cms/location.js
- src/cms/plain-text.js
- src/components/admin/ActionButtons.jsx
- src/components/admin/FieldErrors.jsx
- src/components/admin/GalleryAlbumEditor.jsx
- src/components/admin/ImageField.jsx
- src/components/admin/Notifications.jsx
- src/components/admin/admin-request.js
- src/components/gallery/GalleryAlbum.jsx
- src/components/gallery/GalleryLightbox.jsx
- src/components/shared/LocationMap.jsx
- src/server/media-names.js

- app/api/admin/seo/route.js (redirect boolean responses, existing-ID updates, checked deletion)
