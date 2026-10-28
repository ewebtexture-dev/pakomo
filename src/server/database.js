import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

export function database() {
  if (globalThis.__pakmooDatabase) return globalThis.__pakmooDatabase;
  const directory = process.env.DATA_DIRECTORY || path.join(process.cwd(), '.data');
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
  globalThis.__pakmooDatabase = db;
  return db;
}
