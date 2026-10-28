import { randomUUID } from 'node:crypto';
import sanitizeHtml from 'sanitize-html';
import { database } from './database.js';
import { HttpError } from './http.js';

export const CATEGORIES = ['quality_control','testing_standards','manufacturing','industry_insights','product_updates'];
export const siteUrl = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/,'');
export function slugify(value) {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,160).replace(/-+$/,'');
}
export function cleanContent(value) {
  return sanitizeHtml(value, { allowedTags:['p','br','h2','h3','h4','h5','h6','strong','b','em','i','u','s','ul','ol','li','blockquote','a','img','table','thead','tbody','tr','th','td','pre','code','hr','figure','figcaption'],
    allowedAttributes: {a:['href','title','target','rel'],img:['src','alt','width','height','loading'],th:['scope','colspan'],td:['colspan','rowspan']},
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
  const words = sanitizeHtml(row.content,{allowedTags:[],allowedAttributes:{}}).split(/\s+/).filter(Boolean).length;
  return {...row, noindex: Boolean(row.noindex), imageUrl:row.image_url, imageAlt:row.image_alt,
    shortDescription:row.excerpt, description:row.content, readTime:Math.max(1,Math.ceil(words/200))+' Min',
    date:{seconds:Math.floor(new Date(row.published_at || row.created_at).getTime()/1000)},
    id:row.id, publicId:row.slug, color:'bg-blue-100 text-blue-700'};
}
export function listPosts(includeDrafts = false) {
  return database().prepare(`SELECT * FROM posts ${includeDrafts?'':"WHERE status='published'"} ORDER BY COALESCE(published_at,created_at) DESC`).all().map(serialize);
}
export function findPost(id) { return serialize(database().prepare('SELECT * FROM posts WHERE id=?').get(id)); }
export function publishedPost(slug) {return serialize(database().prepare("SELECT * FROM posts WHERE slug=? AND status='published'").get(slug));}
export function redirectForSlug(slug) {
  return database().prepare("SELECT posts.slug FROM slug_redirects JOIN posts ON posts.id=slug_redirects.post_id WHERE old_slug=? AND status='published'").get(slug)?.slug;
}
export function savePost(input, id) {
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
  const taken = db.prepare('SELECT id FROM posts WHERE slug=?').get(slug);
  const reserved = db.prepare('SELECT post_id FROM slug_redirects WHERE old_slug=?').get(slug);
  if((taken && taken.id!==id) || (reserved && reserved.post_id!==id)) throw new HttpError(409,'This slug is already in use. Please choose another.');
  const now = new Date().toISOString();
  const postId = existing?.id || randomUUID();
  const publishedAt = status==='published' ? (existing?.published_at || now) : existing?.published_at || null;
  const values = [slug,title,excerpt,content,category,text(input.author,120,'Author') || 'PAKMOO',image,alt,metaTitle,metaDescription,canonical,input.noindex===true?1:0,status,publishedAt,now];
  db.exec('BEGIN IMMEDIATE');
  try {
    if(existing) {
      db.prepare(`UPDATE posts SET slug=?,title=?,excerpt=?,content=?,category=?,author=?,image_url=?,image_alt=?,meta_title=?,meta_description=?,canonical_url=?,noindex=?,status=?,published_at=?,updated_at=? WHERE id=?`).run(...values,postId);
      if(existing.slug!==slug) db.prepare('INSERT OR REPLACE INTO slug_redirects(old_slug,post_id) VALUES(?,?)').run(existing.slug,postId);
      db.prepare('DELETE FROM slug_redirects WHERE old_slug=?').run(slug);
    } else {
      db.prepare(`INSERT INTO posts(slug,title,excerpt,content,category,author,image_url,image_alt,meta_title,meta_description,canonical_url,noindex,status,published_at,updated_at,id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(...values,postId,now);
    }
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
