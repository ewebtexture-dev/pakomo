import { normalizeRichHtml } from "../cms/rich-text.js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { database } from "./database.js";
import { audit } from "./security.js";
import { HttpError } from "./http.js";
import { validateContentPayload } from "./content-validation.js";
import {plainText,testimonialText} from '../cms/plain-text.js';
import {isSafeImagePlaceholder} from '../cms/image-placeholder.js';
const kinds = [
  "page",
  "product",
  "category",
  "application",
  "standard",
  "client",
  "testimonial",
  "service",
  "gallery",
  "blogcategory",
];
export const contentInput = z.object({
  kind: z.enum(kinds),
  key: z.string().min(1).max(180),
  title: z.string().min(1).max(250),
  slug: z.string().max(180),
  payload: z.record(z.unknown()),
  status: z.enum(["draft", "published"]),
  enabled: z.boolean().default(true),
  version: z.number().int().optional(),
});
const htmlOptions = {
  allowedTags: [
    "p",
    "br",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "pre",
    "code",
    "hr",
    "figure",
    "figcaption",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "data-size", "data-align", "data-caption"],
    th: ["colspan", "scope"],
    td: ["colspan", "rowspan"],
    span: ["class"],
    p: ["class"],
    figure: ["class"],
  },
  allowedSchemes: ["https", "http", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: {
    a: (tag, attrs) => ({
      tagName: "a",
      attribs: { ...attrs, rel: "noopener noreferrer" },
    }),
  },
};
export const sanitizeRich = (value) =>
  sanitizeHtml(normalizeRichHtml(value), htmlOptions);
export function cleanPayload(value, key = "", depth = 0) {
  if (depth > 20)
    throw new HttpError(422, "Content has too many nested levels.");
  if (typeof value === "string") {
    if (
      key === "blurDataURL" &&
      isSafeImagePlaceholder(value)
    )
      return value;
    if (value.length > 200000)
      throw new HttpError(422, "A field exceeds its size limit.");
    if (
      /^(?:javascript|data|vbscript):/i.test(value.trim()) &&
      /(?:url|src|href|link|image|logo|avatar)/i.test(key)
    )
      throw new HttpError(422, "Use a safe URL.");
    if(key==='quote')return testimonialText(value);
    if(/^(title|meta_?title|meta_?description|og_?title|og_?description|twitterTitle|twitterDescription|breadcrumbTitle)$/i.test(key))return plainText(value);
    return /<\/?[a-z][\s\S]*>/i.test(value) ? sanitizeRich(value) : value;
  }
  if (Array.isArray(value)) {
    if (value.length > 500) throw new HttpError(422, "Too many list items.");
    return value.map((v) => cleanPayload(v, key, depth + 1));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !["__proto__", "constructor", "prototype"].includes(k))
        .map(([k, v]) => [k, cleanPayload(v, k, depth + 1)]),
    );
  }
  return value;
}
export function record(row, publicOnly = false) {
  if (!row) return null;
  const payload = JSON.parse(publicOnly ? row.published_json : row.draft_json);
  return {
    id: row.id,
    kind: row.kind,
    key: row.record_key,
    title: publicOnly
      ? payload.name || payload.title || row.published_title || row.title
      : row.title,
    slug: publicOnly ? row.published_slug : row.draft_slug,
    payload,
    status: row.status,
    enabled: Boolean(publicOnly ? row.enabled : row.draft_enabled),
    version: row.version,
    sort_order: row.sort_order,
    updated_at: publicOnly
      ? row.published_updated_at || row.updated_at
      : row.updated_at,
    updated_by: row.updated_by,
  };
}
export function findContent(id) {
  return record(
    database().prepare("SELECT * FROM content_records WHERE id=?").get(id),
  );
}
export function listContent(kind, publicOnly = false) {
  if (!kinds.includes(kind)) throw new HttpError(422, "Invalid collection.");
  return database()
    .prepare(
      `SELECT * FROM content_records WHERE kind=? ${publicOnly ? "AND published_json IS NOT NULL AND enabled=1" : ""} ORDER BY sort_order,created_at`,
    )
    .all(kind)
    .map((row) => record(row, publicOnly));
}
export function publicContentBySlug(kind, slug) {
  return record(
    database()
      .prepare(
        "SELECT * FROM content_records WHERE kind=? AND published_slug=? AND published_json IS NOT NULL AND enabled=1",
      )
      .get(kind, slug),
    true,
  );
}
export function revision(type, id, snapshot, actor) {
  const db = database();
  db.prepare(
    "INSERT INTO content_revisions(entity_type,entity_id,snapshot_json,actor_id,created_at) VALUES(?,?,?,?,?)",
  ).run(
    type,
    id,
    JSON.stringify(snapshot),
    actor?.id || null,
    new Date().toISOString(),
  );
  db.prepare(
    "DELETE FROM content_revisions WHERE entity_type=? AND entity_id=? AND id NOT IN (SELECT id FROM content_revisions WHERE entity_type=? AND entity_id=? ORDER BY id DESC LIMIT 10)",
  ).run(type, id, type, id);
}
export function saveContent(raw, id, actor) {
  const data = contentInput.parse(raw);
  if (!/^[a-z0-9][a-z0-9&_-]*$/i.test(data.slug || data.key))
    throw new HttpError(
      422,
      "Use a readable slug with letters, numbers and hyphens.",
    );
  if (
    data.kind === "page" &&
    data.key === "global" &&
    actor.role !== "super_admin"
  )
    throw new HttpError(403, "Global navigation requires a Super Admin.");
  const payload = cleanPayload(validateContentPayload(data.kind, data.payload));
  if (
    data.kind === "gallery" &&
    data.status === "published" &&
    (!payload.title?.trim() || !payload.alt?.trim() || !payload.image)
  )
    throw new HttpError(
      422,
      "Title, alt text and image are required before publishing.",
    );
  if (Buffer.byteLength(JSON.stringify(payload)) > 1200000)
    throw new HttpError(413, "Content is too large.");
  const db = database(),
    existing = id ? findContent(id) : null;
  const priorPublished = id
    ? db
        .prepare("SELECT published_slug FROM content_records WHERE id=?")
        .get(id)?.published_slug
    : null;
  if (id && !existing) throw new HttpError(404, "Content not found.");
  if (existing && existing.key !== data.key)
    throw new HttpError(422, "The stable content key cannot change.");
  if (existing && existing.key === "global" && actor.role !== "super_admin")
    throw new HttpError(403, "Global content requires a Super Admin.");
  if (existing && data.kind !== existing.kind)
    throw new HttpError(422, "Collection cannot change.");
  if (existing && data.version !== existing.version)
    throw new HttpError(
      409,
      "This item changed in another session. Reload before saving.",
    );
  for (const [field, kind] of [
    ["category_ids", "category"],
    ["standard_ids", "standard"],
    ["related_ids", "product"],
    ["productsList", "product"],
  ])
    for (const ref of payload[field] || []) {
      if (
        !db
          .prepare(
            "SELECT id FROM content_records WHERE kind=? AND record_key=?",
          )
          .get(kind, ref)
      )
        throw new HttpError(422, "Unknown " + kind + " reference: " + ref);
      if (field === "related_ids" && ref === data.key)
        throw new HttpError(422, "A product cannot relate to itself.");
    }
  const itemId = id || randomUUID(),
    now = new Date().toISOString(),
    json = JSON.stringify(payload);
  db.exec("BEGIN IMMEDIATE");
  try {
    if (existing) {
      revision("content", id, existing, actor);
      db.prepare(
        "UPDATE content_records SET title=?,draft_slug=?,draft_json=?,status=?,draft_enabled=?,version=version+1,updated_at=?,updated_by=? WHERE id=?",
      ).run(
        data.title,
        data.slug,
        json,
        data.status,
        +data.enabled,
        now,
        actor.id,
        id,
      );
    } else
      db.prepare(
        "INSERT INTO content_records(id,kind,record_key,title,draft_slug,draft_json,status,draft_enabled,sort_order,created_at,updated_at,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
      ).run(
        itemId,
        data.kind,
        data.key,
        data.title,
        data.slug,
        json,
        data.status,
        +data.enabled,
        db
          .prepare(
            "SELECT COALESCE(MAX(sort_order),0)+1 n FROM content_records WHERE kind=?",
          )
          .get(data.kind).n,
        now,
        now,
        actor.id,
      );
    if (data.status === "published") {
      db.prepare(
        "UPDATE content_records SET published_slug=?,published_json=?,enabled=draft_enabled,published_title=title,published_updated_at=updated_at WHERE id=?",
      ).run(data.slug, json, itemId);
      if (existing && priorPublished && priorPublished !== data.slug) {
        const prefix = {
          product: "/products/",
          application: "/applications/",
          service: "/services/",
          category: "/products/category/",
          blogcategory: "/blog/category/",
        }[data.kind];
        if (prefix)
          db.prepare(
            "INSERT INTO redirects(id,from_path,to_url,status,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(from_path) DO UPDATE SET to_url=excluded.to_url,updated_at=excluded.updated_at",
          ).run(
            randomUUID(),
            prefix + priorPublished,
            prefix + data.slug,
            301,
            now,
          );
      }
    }
    audit(
      actor,
      data.status === "published" ? "content.publish" : "content.save",
      data.kind,
      itemId,
    );
    db.exec("COMMIT");
    return findContent(itemId);
  } catch (e) {
    db.exec("ROLLBACK");
    if (String(e.message).includes("UNIQUE"))
      throw new HttpError(409, "This key or published slug is already in use.");
    throw e;
  }
}
export function deleteContent(id, actor) {
  const db = database(),
    existing = findContent(id);
  if (!existing) throw new HttpError(404, "Content not found.");
  if (existing.kind === "page")
    throw new HttpError(
      422,
      "Core pages cannot be deleted. Unpublish the page instead.",
    );
  if (
    existing.kind === "blogcategory" &&
    db
      .prepare(
        "SELECT id FROM posts WHERE category=? OR id IN (SELECT post_id FROM post_extras WHERE EXISTS(SELECT 1 FROM json_each(draft_json,'$.category_ids') WHERE value=?) OR EXISTS(SELECT 1 FROM json_each(published_json,'$.category_ids') WHERE value=?)) LIMIT 1",
      )
      .get(existing.key, existing.key, existing.key)
  )
    throw new HttpError(
      409,
      "This category is assigned to articles. Reassign them before deleting.",
    );
  const referenced = db
    .prepare(
      "SELECT id,draft_json,published_json FROM content_records WHERE id<>?",
    )
    .all(id)
    .some((row) =>
      [row.draft_json, row.published_json].filter(Boolean).some((json) => {
        const p = JSON.parse(json);
        return [
          "category_ids",
          "standard_ids",
          "related_ids",
          "productsList",
        ].some((field) => (p[field] || []).includes(existing.key));
      }),
    );
  if (referenced)
    throw new HttpError(
      409,
      "This record is referenced by other content. Remove those relationships first.",
    );
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('INSERT OR IGNORE INTO cms_seed_ledger(kind,record_key) VALUES(?,?)').run(existing.kind,existing.key);
    const result=db.prepare("DELETE FROM content_records WHERE id=?").run(id);
    if(!result.changes)throw new HttpError(404,'Content not found.');
    db.exec('COMMIT');
  } catch(error){db.exec('ROLLBACK');throw error;}
  audit(actor, "content.delete", existing.kind, id);
}
export function unpublishContent(id, actor) {
  const item = findContent(id);
  if (item?.key === "global" && actor.role !== "super_admin")
    throw new HttpError(403, "Global content requires a Super Admin.");
  database()
    .prepare(
      "UPDATE content_records SET published_json=NULL,published_slug=NULL,status='draft',version=version+1 WHERE id=?",
    )
    .run(id);
  audit(actor, "content.unpublish", "content", id);
}
export function seedRecords(seeds) {
  const db = database(),
    now = new Date().toISOString();
  const insert = db.prepare(
    "INSERT OR IGNORE INTO content_records(id,kind,record_key,title,draft_slug,published_slug,draft_json,published_json,status,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
  );
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const [index, seed] of seeds.entries()) {
      if(db.prepare('SELECT 1 FROM cms_seed_ledger WHERE kind=? AND record_key=?').get(seed.kind,seed.key))continue;
      const json = JSON.stringify(seed.payload),
        published = seed.status !== "draft";
      insert.run(
        seed.id || randomUUID(),
        seed.kind,
        seed.key,
        seed.title,
        seed.slug || seed.key,
        published ? seed.slug || seed.key : null,
        json,
        published ? json : null,
        published ? "published" : "draft",
        index,
        now,
        now,
      );
      if (published)
        db.prepare(
          "UPDATE content_records SET published_title=?,published_updated_at=? WHERE kind=? AND record_key=? AND published_title IS NULL",
        ).run(seed.title, now, seed.kind, seed.key);
      db.prepare('INSERT OR IGNORE INTO cms_seed_ledger(kind,record_key) VALUES(?,?)').run(seed.kind,seed.key);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

export function reorderContent(id, target, actor) {
  const db = database(),
    first = findContent(id),
    second = findContent(target);
  if (!first || !second || first.kind !== second.kind)
    throw new HttpError(422, "Choose two records from the same collection.");
  if (first.kind === "page" && actor.role !== "super_admin")
    throw new HttpError(403, "Only a Super Admin can reorder pages.");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(
      "UPDATE content_records SET sort_order=?,version=version+1 WHERE id=?",
    ).run(second.sort_order, id);
    db.prepare(
      "UPDATE content_records SET sort_order=?,version=version+1 WHERE id=?",
    ).run(first.sort_order, target);
    audit(actor, "content.reorder", first.kind, id);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
