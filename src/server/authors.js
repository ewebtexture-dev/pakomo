import { randomUUID } from 'node:crypto';
import { database } from './database.js';
import { HttpError } from './http.js';

function value(input, max, label) {
  if (input == null) return '';
  if (typeof input !== 'string' || input.length > max) throw new HttpError(422, label + ' is invalid or too long.');
  return input.trim();
}
function serialize(author) {
  return author ? {...author, active: Boolean(author.active)} : null;
}
export function listAuthors() {
  return database().prepare(`SELECT authors.*, COUNT(posts.id) AS post_count FROM authors
    LEFT JOIN posts ON posts.author_id=authors.id GROUP BY authors.id ORDER BY authors.name COLLATE NOCASE`).all().map(serialize);
}
export function findAuthor(id) {return serialize(database().prepare('SELECT * FROM authors WHERE id=?').get(id));}
export function saveAuthor(input, id) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new HttpError(422, 'Invalid author.');
  if (id && !findAuthor(id)) throw new HttpError(404, 'Author not found.');
  const name = value(input.name, 120, 'Name');
  const slug = (value(input.slug, 160, 'Slug') || name).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  if (!name || !slug) throw new HttpError(422, 'An author name and URL slug are required.');
  const website = value(input.website_url, 2000, 'Website');
  if (website) {try {const url=new URL(website); if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error();}catch{throw new HttpError(422,'Use a full HTTP or HTTPS website URL.');}}
  const avatar = value(input.avatar_url, 2000, 'Photo URL');
  if (avatar && !/^\/media\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(avatar)) {
    try {if(new URL(avatar).protocol!=='https:')throw Error();}catch{throw new HttpError(422,'Upload a photo or use an HTTPS image URL.');}
  }
  const db=database();
  const duplicate=db.prepare('SELECT id FROM authors WHERE slug=?').get(slug);
  if(duplicate && duplicate.id!==id)throw new HttpError(409,'An author with this slug already exists.');
  const now=new Date().toISOString(), authorId=id || randomUUID();
  const values=[name,slug,value(input.bio,5000,'Biography'),value(input.job_title,160,'Job title'),avatar,website,input.active===false?0:1,now];
  try {
    if(id)db.prepare('UPDATE authors SET name=?,slug=?,bio=?,job_title=?,avatar_url=?,website_url=?,active=?,updated_at=? WHERE id=?').run(...values,id);
    else db.prepare('INSERT INTO authors(name,slug,bio,job_title,avatar_url,website_url,active,updated_at,id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(...values,authorId,now);
  }catch(error){if(error.message?.includes('UNIQUE constraint'))throw new HttpError(409,'An author with this slug already exists.');throw error;}
  return findAuthor(authorId);
}
export function deleteAuthor(id) {
  const db=database();
  if(!findAuthor(id))throw new HttpError(404,'Author not found.');
  if(db.prepare('SELECT id FROM posts WHERE author_id=? LIMIT 1').get(id))throw new HttpError(409,'This author has blog posts. Reassign those posts or deactivate the author instead.');
  try {db.prepare('DELETE FROM authors WHERE id=?').run(id);}catch(error){if(error.message?.includes('FOREIGN KEY constraint'))throw new HttpError(409,'This author is assigned to a blog. Reassign the blog first.');throw error;}
}
