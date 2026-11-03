import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {rewriteFirebaseReferences} from '../cms/firebase-migration.js';

// A narrow, backed-up data migration. Account/password/session tables are untouched.
export function migrateFirebaseStorage(db, manifest) {
  const urls=new Map(manifest.files.map(file=>[file.source,file.targetUrl]));
  const fingerprint=createHash('sha256').update(JSON.stringify([...urls].sort(([a],[b])=>a.localeCompare(b)))).digest('hex').slice(0,16);
  const version='update_firebase_storage_'+fingerprint;
  if(db.prepare('SELECT 1 FROM schema_migrations WHERE version=?').get(version))return {alreadyApplied:true,changedRows:0};
  const location=db.prepare('PRAGMA database_list').all().find(row=>row.name==='main')?.file;
  if(location){const backup=path.join(path.dirname(location),'pre-'+version+'.sqlite');if(!fs.existsSync(backup)){db.exec("VACUUM INTO '"+backup.replaceAll("'","''")+"'");const check=new DatabaseSync(backup,{readOnly:true});try{if(check.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('Firebase cutover backup integrity check failed');}finally{check.close();}}}
  const tables=[
    ['content_records','id',['draft_json','published_json'],true],
    ['site_settings','scope',['value_json'],true],
    ['post_extras','post_id',['draft_json','published_json'],true],
    ['post_publications','post_id',['payload_json'],true],
    ['content_revisions','id',['snapshot_json'],true],
    ['posts','id',['content','image_url','og_image'],false],
    ['authors','id',['bio','avatar_url'],false],
    ['media','id',['url'],false],
  ];let changedRows=0;
  db.exec('BEGIN IMMEDIATE');
  try{
    for(const [table,key,candidates,json]of tables){const columnsInfo=db.prepare(`PRAGMA table_info(${table})`).all();if(!columnsInfo.length)continue;const available=new Set(columnsInfo.map(c=>c.name)),columns=candidates.filter(c=>available.has(c));if(!columns.length)continue;
      for(const row of db.prepare(`SELECT ${key},${columns.join(',')} FROM ${table}`).all()){
        const next=columns.map(c=>{if(row[c]==null)return row[c];if(!json)return rewriteFirebaseReferences(row[c],urls);const original=JSON.parse(row[c]),rewritten=JSON.stringify(rewriteFirebaseReferences(original,urls));return rewritten===JSON.stringify(original)?row[c]:rewritten;});
        if(!next.some((v,i)=>v!==row[columns[i]]))continue;
        db.prepare(`UPDATE ${table} SET ${columns.map(c=>c+'=?').join(',')}${available.has('version')?',version=version+1':''} WHERE ${key}=?`).run(...next,row[key]);changedRows++;
      }
    }
    db.prepare('INSERT INTO schema_migrations(version,applied_at) VALUES(?,?)').run(version,new Date().toISOString());
    db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error;}
  return {alreadyApplied:false,changedRows,version};
}
