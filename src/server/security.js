import {createHash,createHmac,randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import bcrypt from 'bcryptjs';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {dataDirectory} from './data-directory.js';
import {database} from './database.js';

export const digest=value=>createHash('sha256').update(String(value)).digest('hex');
export function secretKey(){let key=process.env.CMS_SECRET_KEY;if(!key){try{key=readFileSync(path.join(dataDirectory(),'.cms-secret'),'utf8').trim();}catch{}}if(!key||key.length<32)throw Error('Set CMS_SECRET_KEY to at least 32 random characters.');return createHash('sha256').update(key).digest();}
export const keyedHash=value=>createHmac('sha256',secretKey()).update(String(value)).digest('hex');
export function encrypt(value){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',secretKey(),iv);const bytes=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return [iv.toString('base64'),cipher.getAuthTag().toString('base64'),bytes.toString('base64')].join('.');}
export function decrypt(value){const [iv,tag,bytes]=value.split('.');const decipher=createDecipheriv('aes-256-gcm',secretKey(),Buffer.from(iv,'base64'));decipher.setAuthTag(Buffer.from(tag,'base64'));return JSON.parse(Buffer.concat([decipher.update(Buffer.from(bytes,'base64')),decipher.final()]).toString('utf8'));}
export function passwordHash(value){if(typeof value!=='string'||value.length<8||Buffer.byteLength(value)>72)throw Error('Use a password of 8–72 bytes.');return bcrypt.hashSync(value,12);}
export function rateLimit(key,limit,windowMs,now=Date.now()){
 const db=database(),hash=digest(key);const row=db.prepare('SELECT * FROM rate_limit_buckets WHERE key_hash=?').get(hash);
 if(row?.expires_at>now&&row.count>=limit)return false;
 db.prepare('INSERT INTO rate_limit_buckets VALUES(?,?,?) ON CONFLICT(key_hash) DO UPDATE SET count=excluded.count,expires_at=excluded.expires_at').run(hash,row?.expires_at>now?row.count+1:1,row?.expires_at>now?row.expires_at:now+windowMs);return true;
}
export function requestIp(request){return process.env.TRUST_PROXY==='1'?(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'):'shared';}
export function audit(actor,action,type,id,details={}){database().prepare('INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,details_json,created_at) VALUES(?,?,?,?,?,?)').run(actor?.id||null,action,type,String(id),JSON.stringify(details),new Date().toISOString());}
