import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { migrateCms } from './cms-migrations.js';
import {dataDirectory} from './data-directory.js';

export function database() {
  if (globalThis.__pakmooDatabase) return globalThis.__pakmooDatabase;
  const directory = dataDirectory();
  mkdirSync(directory, { recursive: true });
  const db = new DatabaseSync(path.join(directory, 'website.sqlite'));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL, salt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, admin_id INTEGER NOT NULL REFERENCES admins(id),
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS login_attempts (
      username TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'industry_insights', author TEXT NOT NULL DEFAULT 'PAKMOO',
      image_url TEXT NOT NULL DEFAULT '', image_alt TEXT NOT NULL DEFAULT '',
      meta_title TEXT NOT NULL DEFAULT '', meta_description TEXT NOT NULL DEFAULT '',
      canonical_url TEXT NOT NULL DEFAULT '', noindex INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
      published_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS posts_status_date ON posts(status, published_at);
    CREATE TABLE IF NOT EXISTS slug_redirects (
      old_slug TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE
    );
  `);
  db.exec(`CREATE TABLE IF NOT EXISTS authors (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
    bio TEXT NOT NULL DEFAULT '', job_title TEXT NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '', website_url TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);
  db.exec('BEGIN IMMEDIATE');
  try {
    const columns = new Set(db.prepare('PRAGMA table_info(posts)').all().map(column => column.name));
    const additions = {
      author_id: 'TEXT REFERENCES authors(id) ON DELETE RESTRICT',
      focus_keyword: "TEXT NOT NULL DEFAULT ''", meta_keywords: "TEXT NOT NULL DEFAULT ''",
      og_title: "TEXT NOT NULL DEFAULT ''", og_description: "TEXT NOT NULL DEFAULT ''",
      og_image: "TEXT NOT NULL DEFAULT ''", nofollow: 'INTEGER NOT NULL DEFAULT 0',
    };
    for (const [name, type] of Object.entries(additions)) {
      if (!columns.has(name)) db.exec(`ALTER TABLE posts ADD COLUMN ${name} ${type}`);
    }
    // Keep existing author names and assign them real author records once.
    const legacy = db.prepare("SELECT DISTINCT COALESCE(NULLIF(TRIM(author), ''), 'PAKMOO') AS name FROM posts WHERE author_id IS NULL").all();
    if (!db.prepare('SELECT id FROM authors LIMIT 1').get() && !legacy.some(author => author.name === 'PAKMOO')) legacy.push({name: 'PAKMOO'});
    const now = new Date().toISOString();
    for (const {name} of legacy) {
      let author = db.prepare('SELECT id FROM authors WHERE name=? ORDER BY created_at LIMIT 1').get(name);
      if (!author) {
        const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'author';
        let slug = base; let suffix = 1;
        while (db.prepare('SELECT id FROM authors WHERE slug=?').get(slug)) slug = base + '-' + suffix++;
        author = {id: randomUUID()};
        db.prepare('INSERT INTO authors(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run(author.id,name,slug,now,now);
      }
      db.prepare("UPDATE posts SET author_id=? WHERE author_id IS NULL AND COALESCE(NULLIF(TRIM(author),''),'PAKMOO')=?").run(author.id,name);
    }
    db.exec('CREATE INDEX IF NOT EXISTS posts_author_id ON posts(author_id)');
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  migrateCms(db);
  globalThis.__pakmooDatabase = db;
  return db;
}
