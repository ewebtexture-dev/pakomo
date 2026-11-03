import fs from 'node:fs';import path from 'node:path';import{createHash}from'node:crypto';
import{migrateFirebaseStorage}from'./firebase-storage-migration.js';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export function migrateHostingerOnly(db,manifest,{assetDirectory=path.join(process.cwd(),'public','hosted-assets')}={}){
 const version='hostinger_only_'+hash(JSON.stringify({files:manifest.files,owner:manifest.ownerEmail,onlyOwner:Boolean(manifest.onlyOwner)})).slice(0,16);
 if(db.prepare('SELECT 1 FROM schema_migrations WHERE version=?').get(version))return{alreadyApplied:true,files:0};
 const location=db.prepare('PRAGMA database_list').all().find(row=>row.name==='main')?.file;if(!location)throw Error('Hostinger media migration requires a persistent database');
 const uploadDirectory=path.join(path.dirname(location),'uploads');fs.mkdirSync(uploadDirectory,{recursive:true});
 for(const asset of manifest.assets){if(!/^[a-z0-9][a-z0-9-]{0,150}\.(jpg|png|webp)$/.test(asset.filename))throw Error('Invalid imported media filename');const destination=path.join(uploadDirectory,asset.filename);if(fs.existsSync(destination)){if(hash(fs.readFileSync(destination))!==asset.sha256)throw Error('Imported media conflict: '+asset.filename);continue;}const source=path.join(assetDirectory,asset.filename),bytes=fs.readFileSync(source);if(hash(bytes)!==asset.sha256||bytes.length!==asset.bytes)throw Error('Imported media checksum failed');fs.writeFileSync(destination,bytes,{flag:'wx',mode:0o600});}
 const cutover=migrateFirebaseStorage(db,manifest);
 db.exec('BEGIN IMMEDIATE');
 try{
  if(db.prepare('SELECT 1 FROM schema_migrations WHERE version=?').get(version)){db.exec('COMMIT');return{alreadyApplied:true,files:0};}
  const now=new Date().toISOString();
  for(const asset of manifest.assets){const hex=hash(asset.filename),id=`${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;db.prepare('INSERT OR IGNORE INTO media(id,filename,url,original_name,mime,bytes,width,height,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(id,asset.filename,asset.url,asset.originalName,asset.mime,asset.bytes,asset.width,asset.height,now);}
  db.prepare("DELETE FROM site_settings WHERE scope='firebase'").run();
  const email=manifest.ownerEmail.toLowerCase();const owner=db.prepare('SELECT id FROM admins WHERE lower(email)=? ORDER BY id LIMIT 1').get(email)||db.prepare("SELECT id FROM admins ORDER BY CASE WHEN role='super_admin' THEN 0 ELSE 1 END,id LIMIT 1").get();
  if(owner){db.prepare("UPDATE admins SET email=?,role='super_admin',active=1 WHERE id=?").run(email,owner.id);if(manifest.onlyOwner)db.prepare('UPDATE admins SET active=0 WHERE id<>?').run(owner.id);}
  // Revoke pre-cutover sessions and recovery grants; keep existing passwords.
  db.exec('DELETE FROM sessions;DELETE FROM reset_grants;');db.prepare('UPDATE otp_tokens SET consumed_at=? WHERE consumed_at IS NULL').run(Date.now());
  db.prepare('INSERT INTO schema_migrations(version,applied_at) VALUES(?,?)').run(version,now);db.exec('COMMIT');
 }catch(error){db.exec('ROLLBACK');throw error;}
 return{alreadyApplied:false,files:manifest.assets.length,changedRows:cutover.changedRows};
}
