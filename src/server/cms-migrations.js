import fs from 'node:fs';
import path from 'node:path';
import {testimonialText,plainText} from '../cms/plain-text.js';
export function migrateCms(db) {
  db.exec('CREATE TABLE IF NOT EXISTS cms_seed_ledger(kind TEXT NOT NULL,record_key TEXT NOT NULL,PRIMARY KEY(kind,record_key))');
  db.exec('CREATE TABLE IF NOT EXISTS media_aliases(filename TEXT PRIMARY KEY,media_id TEXT NOT NULL)');
  db.exec(`PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY,applied_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS content_records(
      id TEXT PRIMARY KEY,kind TEXT NOT NULL,record_key TEXT NOT NULL,title TEXT NOT NULL,
      draft_slug TEXT NOT NULL DEFAULT '',published_slug TEXT,
      draft_json TEXT NOT NULL CHECK(json_valid(draft_json)),published_json TEXT CHECK(published_json IS NULL OR json_valid(published_json)),
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),sort_order INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,updated_at TEXT NOT NULL,updated_by INTEGER REFERENCES admins(id),
      UNIQUE(kind,record_key));
    CREATE UNIQUE INDEX IF NOT EXISTS content_slug ON content_records(kind,published_slug) WHERE published_slug IS NOT NULL;
    CREATE INDEX IF NOT EXISTS content_kind_order ON content_records(kind,sort_order);
    CREATE TABLE IF NOT EXISTS content_revisions(id INTEGER PRIMARY KEY,entity_type TEXT NOT NULL,entity_id TEXT NOT NULL,snapshot_json TEXT NOT NULL,actor_id INTEGER REFERENCES admins(id),created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS site_settings(scope TEXT PRIMARY KEY,value_json TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,updated_by INTEGER REFERENCES admins(id),updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit_logs(id INTEGER PRIMARY KEY,actor_id INTEGER REFERENCES admins(id),action TEXT NOT NULL,entity_type TEXT NOT NULL,entity_id TEXT NOT NULL,details_json TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS otp_tokens(id TEXT PRIMARY KEY,admin_id INTEGER NOT NULL REFERENCES admins(id),purpose TEXT NOT NULL,email TEXT NOT NULL,code_hash TEXT NOT NULL,expires_at INTEGER NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,consumed_at INTEGER,resend_after INTEGER NOT NULL,created_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS otp_admin ON otp_tokens(admin_id,purpose,created_at);
    CREATE TABLE IF NOT EXISTS reset_grants(token_hash TEXT PRIMARY KEY,admin_id INTEGER NOT NULL REFERENCES admins(id),otp_id TEXT NOT NULL REFERENCES otp_tokens(id),purpose TEXT NOT NULL,expires_at INTEGER NOT NULL,consumed_at INTEGER);
    CREATE TABLE IF NOT EXISTS rate_limit_buckets(key_hash TEXT PRIMARY KEY,count INTEGER NOT NULL,expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS enquiries(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL,company TEXT NOT NULL DEFAULT '',industry TEXT NOT NULL DEFAULT '',product_interest TEXT NOT NULL DEFAULT '',subject TEXT NOT NULL DEFAULT '',message TEXT NOT NULL,source_url TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'new',read_at TEXT,notes TEXT NOT NULL DEFAULT '',delivery_status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS enquiry_date ON enquiries(created_at);
    CREATE TABLE IF NOT EXISTS email_jobs(id TEXT PRIMARY KEY,enquiry_id TEXT REFERENCES enquiries(id) ON DELETE SET NULL,kind TEXT NOT NULL,payload_encrypted TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,next_attempt_at INTEGER NOT NULL,last_error TEXT,sent_at TEXT,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,filename TEXT NOT NULL UNIQUE,url TEXT NOT NULL,original_name TEXT NOT NULL,mime TEXT NOT NULL,bytes INTEGER NOT NULL,width INTEGER,height INTEGER,alt TEXT NOT NULL DEFAULT '',caption TEXT NOT NULL DEFAULT '',created_by INTEGER REFERENCES admins(id),created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS redirects(id TEXT PRIMARY KEY,from_path TEXT NOT NULL UNIQUE,to_url TEXT NOT NULL,status INTEGER NOT NULL CHECK(status IN (301,302)),enabled INTEGER NOT NULL DEFAULT 1,updated_by INTEGER REFERENCES admins(id),updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS post_publications(post_id TEXT PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,slug TEXT NOT NULL UNIQUE,payload_json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS post_extras(post_id TEXT PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,draft_json TEXT NOT NULL DEFAULT '{}',published_json TEXT NOT NULL DEFAULT '{}');
  `);
  if(!db.prepare("SELECT version FROM schema_migrations WHERE version='2910:02'").get()){const location=db.prepare('PRAGMA database_list').all().find(row=>row.name==='main')?.file;if(location){const backup=path.join(path.dirname(location),'pre-2910-02-backup.sqlite');if(!fs.existsSync(backup))db.exec("VACUUM INTO '"+backup.replaceAll("'","''")+"'");}db.prepare('INSERT INTO schema_migrations VALUES(?,?)').run('2910:02',new Date().toISOString());}
  const contentColumns=new Set(db.prepare('PRAGMA table_info(content_records)').all().map(c=>c.name));
  for(const [column,type]of [['published_title','TEXT'],['published_updated_at','TEXT']])if(!contentColumns.has(column)){db.exec('ALTER TABLE content_records ADD COLUMN '+column+' '+type);db.exec('UPDATE content_records SET '+column+'='+(column==='published_title'?'title':'updated_at')+' WHERE published_json IS NOT NULL');}
  if(!contentColumns.has('draft_enabled')){db.exec('ALTER TABLE content_records ADD COLUMN draft_enabled INTEGER NOT NULL DEFAULT 1');db.exec('UPDATE content_records SET draft_enabled=enabled');}
  const columns=new Set(db.prepare('PRAGMA table_info(admins)').all().map(c=>c.name));
  for(const [name,type] of Object.entries({email:'TEXT',display_name:"TEXT NOT NULL DEFAULT 'PAKMOO Admin'",role:"TEXT NOT NULL DEFAULT 'super_admin'",active:'INTEGER NOT NULL DEFAULT 1',hash_scheme:"TEXT NOT NULL DEFAULT 'scrypt'",email_verified_at:'TEXT'}))if(!columns.has(name))db.exec(`ALTER TABLE admins ADD COLUMN ${name} ${type}`);
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS admins_email ON admins(email) WHERE email IS NOT NULL');
  const first=db.prepare('SELECT id FROM admins ORDER BY id LIMIT 1').get();
  if(first)db.prepare('UPDATE admins SET email=COALESCE(email,?) WHERE id=?').run(process.env.ADMIN_RESET_EMAIL||'juhityagi09@gmail.com',first.id);
  if(!db.prepare("SELECT version FROM schema_migrations WHERE version='2910-post-snapshots'").get()){
    const rows=db.prepare("SELECT * FROM posts WHERE status='published'").all();for(const row of rows)db.prepare('INSERT OR IGNORE INTO post_publications(post_id,slug,payload_json) VALUES(?,?,?)').run(row.id,row.slug,JSON.stringify(row));
    db.prepare("INSERT INTO schema_migrations VALUES('2910-post-snapshots',?)").run(new Date().toISOString());
  }
  db.prepare("INSERT OR IGNORE INTO schema_migrations VALUES('2910-cms',?)").run(new Date().toISOString());
  if(!db.prepare("SELECT version FROM schema_migrations WHERE version='311001-clean-text'").get()){
    const location=db.prepare('PRAGMA database_list').all().find(row=>row.name==='main')?.file;
    if(location){const backup=path.join(path.dirname(location),'pre-311001-backup.sqlite');if(!fs.existsSync(backup))db.exec("VACUUM INTO '"+backup.replaceAll("'","''")+"'");}
    const clean=value=>{if(Array.isArray(value))return value.map(clean);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k==='quote'&&typeof v==='string'?testimonialText(v):/^(meta_?title|meta_?description|og_?title|og_?description|twitterTitle|twitterDescription|breadcrumbTitle)$/i.test(k)&&typeof v==='string'?plainText(v):clean(v)]));return value;};
    db.exec('BEGIN IMMEDIATE');try{for(const row of db.prepare('SELECT id,draft_json,published_json FROM content_records').all())db.prepare('UPDATE content_records SET draft_json=?,published_json=? WHERE id=?').run(JSON.stringify(clean(JSON.parse(row.draft_json))),row.published_json?JSON.stringify(clean(JSON.parse(row.published_json))):null,row.id);db.prepare('INSERT INTO schema_migrations VALUES(?,?)').run('311001-clean-text',new Date().toISOString());db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
  }
  if(!db.prepare("SELECT version FROM schema_migrations WHERE version='311001-navigation'").get()){
    const global=db.prepare("SELECT id,draft_json,published_json FROM content_records WHERE kind='page' AND record_key='global'").get();
    if(global){const add=json=>{if(!json)return null;const p=JSON.parse(json),header=p.sections?.header;if(header){const items=header.items_navLinks||[];if(!items.some(i=>i.path==='/gallery'))header.items_navLinks=[...items,{id:'gallery-navigation',label:'Gallery',path:'/gallery',enabled:true,newTab:false,children:[]}];}return JSON.stringify(p);};db.prepare('UPDATE content_records SET draft_json=?,published_json=? WHERE id=?').run(add(global.draft_json),add(global.published_json),global.id);}
    db.prepare('INSERT INTO schema_migrations VALUES(?,?)').run('311001-navigation',new Date().toISOString());
  }

}
