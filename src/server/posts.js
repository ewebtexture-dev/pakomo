import { randomUUID } from 'node:crypto';
import sanitizeHtml from 'sanitize-html';
import { database } from './database.js';
import { HttpError } from './http.js';
import { findAuthor } from './authors.js';
import {seoSchema} from './content-validation.js';
import {cleanPayload,revision} from './cms.js';
import {audit} from './security.js';

export const CATEGORIES = ['quality_control','testing_standards','manufacturing','industry_insights','product_updates'];
export const siteUrl = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/,'');
export function slugify(value) {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,160).replace(/-+$/,'');
}
export function cleanContent(value) {
  return sanitizeHtml(value, { allowedTags:['p','span','br','h2','h3','h4','h5','h6','strong','b','em','i','u','s','ul','ol','li','blockquote','a','img','table','thead','tbody','tr','th','td','pre','code','hr','figure','figcaption'],
    allowedAttributes: {a:['href','title','target','rel'],img:['src','alt','width','height','loading'],th:['scope','colspan'],td:['colspan','rowspan'],p:['class'],h2:['class'],h3:['class'],h4:['class'],li:['class'],ol:['class'],ul:['class'],span:['class']},
    allowedClasses: {'*':['ql-align-center','ql-align-right','ql-align-justify','ql-indent-1','ql-indent-2','ql-indent-3','ql-indent-4','ql-indent-5','ql-indent-6','ql-indent-7','ql-indent-8']},
    allowedSchemes:['https','http','mailto','tel'], allowedSchemesByTag:{img:['https','http']}, allowProtocolRelative:false,
    transformTags: {a:(tag,attrs)=>({tagName:tag,attribs:{...attrs,rel:'noopener noreferrer'}})} });
}
function text(value, max, name, fallback = '') {
  if (value === undefined || value === null) return fallback;
  if(typeof value !== 'string' || value.length > max) throw new HttpError(422, name+' is too long or invalid.');
  return value.trim();
}
function validImage(value) {
  if (!value) return '';
  if (/^\/(?!\/)[a-zA-Z0-9/_\-.]+$/.test(value)) return value;
  try { if(new URL(value).protocol === 'https:') return value; } catch {}
  throw new HttpError(422,'Use an uploaded image or an HTTPS image URL.');
}
function serialize(row) {
  if(!row) return null;
  const assigned = row.author_id ? findAuthor(row.author_id) : null;
  const authorProfile = assigned ? {id:assigned.id,name:assigned.name,slug:assigned.slug,bio:assigned.bio,job_title:assigned.job_title,avatar_url:assigned.avatar_url,website_url:assigned.website_url} : null;
  const words = sanitizeHtml(row.content,{allowedTags:[],allowedAttributes:{}}).split(/\s+/).filter(Boolean).length;
  const extra=JSON.parse(row._extra_json||database().prepare('SELECT draft_json FROM post_extras WHERE post_id=?').get(row.id)?.draft_json||'{}');
  return {...row,...extra, author:assigned?.name || row.author, authorProfile, noindex: Boolean(row.noindex), nofollow:Boolean(row.nofollow), imageUrl:row.image_url, imageAlt:row.image_alt,
    shortDescription:row.excerpt, description:row.content, readTime:Math.max(1,Math.ceil(words/200))+' Min',
    date:{seconds:Math.floor(new Date(row.published_at || row.created_at).getTime()/1000)},
    id:row.id, publicId:row.slug, color:'bg-blue-100 text-blue-700'};
}
export function listPosts(includeDrafts=false){const db=database();if(includeDrafts)return db.prepare('SELECT * FROM posts ORDER BY COALESCE(published_at,created_at) DESC').all().map(serialize);return db.prepare('SELECT p.payload_json,e.published_json FROM post_publications p LEFT JOIN post_extras e ON e.post_id=p.post_id').all().map(row=>serialize({...JSON.parse(row.payload_json),_extra_json:row.published_json||'{}'})).sort((a,b)=>String(b.published_at||b.created_at).localeCompare(String(a.published_at||a.created_at)));}
export function findPost(id){return serialize(database().prepare('SELECT * FROM posts WHERE id=?').get(id));}
export function publishedPost(slug){const row=database().prepare('SELECT p.payload_json,e.published_json FROM post_publications p LEFT JOIN post_extras e ON e.post_id=p.post_id WHERE p.slug=?').get(slug);return row?serialize({...JSON.parse(row.payload_json),_extra_json:row.published_json||'{}'}):null;}
export function redirectForSlug(slug){return database().prepare('SELECT p.slug FROM slug_redirects r JOIN post_publications p ON p.post_id=r.post_id WHERE r.old_slug=?').get(slug)?.slug;}
export function unpublishPost(id,actor){const db=database();db.prepare('DELETE FROM post_publications WHERE post_id=?').run(id);db.prepare("UPDATE posts SET status='draft' WHERE id=?").run(id);audit(actor,'post.unpublish','post',id);}
export function savePost(input, id, actor=null) {
  if(!input || typeof input !== 'object' || Array.isArray(input)) throw new HttpError(422,'Invalid article.');
  const existing = id ? findPost(id) : null;
  if(id && !existing) throw new HttpError(404,'Article not found.');
  const title = text(input.title,180,'Title');
  const slug = slugify(text(input.slug,180,'Slug') || title);
  const excerpt = text(input.excerpt,500,'Excerpt');
  const content = cleanContent(text(input.content,200000,'Content'));
  const status = input.status || 'draft';
  if(!title || !slug) throw new HttpError(422,'A title and URL slug are required.');
  if(!['draft','published'].includes(status)) throw new HttpError(422,'Choose draft or published.');
  const category = text(input.category,80,'Category','industry_insights');
  if(!CATEGORIES.includes(category)) throw new HttpError(422,'Select a valid category.');
  const image = validImage(text(input.image_url,2000,'Image URL'));
  const alt = text(input.image_alt,250,'Image alt text');
  const metaTitle = text(input.meta_title,180,'SEO title');
  const metaDescription = text(input.meta_description,320,'Meta description');
  const canonical = text(input.canonical_url,2000,'Canonical URL');
  if(canonical) { try {if(!['http:','https:'].includes(new URL(canonical).protocol)) throw Error();} catch {throw new HttpError(422,'Canonical URL must be a full HTTP or HTTPS URL.');} }
  if(status==='published' && (!excerpt || !sanitizeHtml(content,{allowedTags:[],allowedAttributes:{}}).trim() || !image || !alt)) throw new HttpError(422,'Published articles need an excerpt, content, a featured image, and image alt text.');
  const db = database();
  let authorId = text(input.author_id,36,'Author ID') || existing?.author_id;
  if (!authorId) {
    const legacyName = text(input.author,120,'Author') || 'PAKMOO';
    authorId = db.prepare('SELECT id FROM authors WHERE name=? AND active=1 ORDER BY created_at LIMIT 1').get(legacyName)?.id;
  }
  const assignedAuthor = authorId ? findAuthor(authorId) : null;
  if(!assignedAuthor || (!assignedAuthor.active && authorId!==existing?.author_id))throw new HttpError(422,'Choose an active author from the author module.');
  const focusKeyword=text(input.focus_keyword,150,'Focus keyword');
  const metaKeywords=text(input.meta_keywords,500,'Topic tags');
  const ogTitle=text(input.og_title,180,'Social title');
  const ogDescription=text(input.og_description,320,'Social description');
  const ogImage=validImage(text(input.og_image,2000,'Social image'));
  const taken = db.prepare('SELECT id FROM posts WHERE slug=?').get(slug);
  const reserved = db.prepare('SELECT post_id FROM slug_redirects WHERE old_slug=?').get(slug);
  if((taken && taken.id!==id) || (reserved && reserved.post_id!==id)) throw new HttpError(409,'This slug is already in use. Please choose another.');
  const extra=cleanPayload({extra_seo:seoSchema.parse(input.extra_seo||{}),schema:input.schema||{}});if(extra.schema.customJson){try{JSON.parse(extra.schema.customJson);}catch{throw new HttpError(422,'Custom JSON-LD is invalid.');}}
  const now = new Date().toISOString();
  const postId = existing?.id || randomUUID();
  const publishedAt = status==='published' ? (existing?.published_at || now) : existing?.published_at || null;
  const record = {slug,title,excerpt,content,category,author:assignedAuthor.name,image_url:image,image_alt:alt,
    meta_title:metaTitle,meta_description:metaDescription,canonical_url:canonical,noindex:input.noindex===true?1:0,
    status,published_at:publishedAt,updated_at:now,author_id:authorId,focus_keyword:focusKeyword,meta_keywords:metaKeywords,
    og_title:ogTitle,og_description:ogDescription,og_image:ogImage,nofollow:input.nofollow===true?1:0};
  const columns=Object.keys(record), values=Object.values(record);
  db.exec('BEGIN IMMEDIATE');
  try {
    if(existing) {
      revision('post',postId,existing,actor);
      db.prepare(`UPDATE posts SET ${columns.map(key=>key+'=?').join(',')} WHERE id=?`).run(...values,postId);
      const prior=db.prepare('SELECT slug FROM post_publications WHERE post_id=?').get(postId);
      if(status==='published'&&prior&&prior.slug!==slug)db.prepare('INSERT OR REPLACE INTO slug_redirects(old_slug,post_id) VALUES(?,?)').run(prior.slug,postId);
      db.prepare('DELETE FROM slug_redirects WHERE old_slug=?').run(slug);
    } else {
      db.prepare(`INSERT INTO posts(${columns.join(',')},id,created_at) VALUES(${[...values,postId,now].map(()=>'?').join(',')})`).run(...values,postId,now);
    }
    db.prepare('INSERT INTO post_extras(post_id,draft_json) VALUES(?,?) ON CONFLICT(post_id) DO UPDATE SET draft_json=excluded.draft_json').run(postId,JSON.stringify(extra));
    if(status==='published'){const raw=db.prepare('SELECT * FROM posts WHERE id=?').get(postId);db.prepare('INSERT INTO post_publications(post_id,slug,payload_json) VALUES(?,?,?) ON CONFLICT(post_id) DO UPDATE SET slug=excluded.slug,payload_json=excluded.payload_json').run(postId,slug,JSON.stringify(raw));db.prepare('UPDATE post_extras SET published_json=draft_json WHERE post_id=?').run(postId);}
    audit(actor,status==='published'?'post.publish':'post.save','post',postId);
    db.exec('COMMIT');
  } catch(error) {db.exec('ROLLBACK');if(error.code?.includes('CONSTRAINT') || error.message?.includes('UNIQUE constraint')) throw new HttpError(409,'This slug is already in use.'); throw error;}
  return findPost(postId);
}
export function deletePost(id) {
  const db=database();
  db.exec('BEGIN IMMEDIATE');
  try { db.prepare('DELETE FROM slug_redirects WHERE post_id=?').run(id); const result=db.prepare('DELETE FROM posts WHERE id=?').run(id);db.exec('COMMIT'); if(!result.changes)throw new HttpError(404,'Article not found.'); }
  catch(error){if(db.isTransaction)db.exec('ROLLBACK');throw error;}
}
