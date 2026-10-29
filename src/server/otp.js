import {randomInt,randomUUID,randomBytes,timingSafeEqual} from 'node:crypto';
import {database} from './database.js';
import {digest,keyedHash,rateLimit,passwordHash,audit} from './security.js';
import {enqueueMail,mailConfigured} from './mail.js';
export const OTP_DURATION=600000,OTP_COOLDOWN=60000,OTP_ATTEMPTS=5;
export const genericOtpMessage='If this account is eligible, a verification code will be emailed shortly.';
export function issueOtp(email,purpose='reset',ip='shared',now=Date.now(),adminId=null){
 email=String(email).trim().toLowerCase();
 if(!rateLimit('otp-ip:'+ip,10,3600000,now)||!rateLimit('otp-email:'+email,5,3600000,now))return;
 const db=database(),admin=adminId?db.prepare('SELECT * FROM admins WHERE id=? AND active=1').get(adminId):db.prepare('SELECT * FROM admins WHERE email=? AND active=1').get(email);if(!admin||!mailConfigured())return;
 const previous=db.prepare('SELECT * FROM otp_tokens WHERE admin_id=? AND purpose=? ORDER BY created_at DESC LIMIT 1').get(admin.id,purpose);if(previous?.resend_after>now)return;
 const code=String(randomInt(0,1000000)).padStart(6,'0'),id=randomUUID();
 db.exec('BEGIN IMMEDIATE');try{db.prepare('UPDATE otp_tokens SET consumed_at=? WHERE admin_id=? AND purpose=? AND consumed_at IS NULL').run(now,admin.id,purpose);db.prepare('INSERT INTO otp_tokens(id,admin_id,purpose,email,code_hash,expires_at,resend_after,created_at) VALUES(?,?,?,?,?,?,?,?)').run(id,admin.id,purpose,email,keyedHash(id+':'+code),now+OTP_DURATION,now+OTP_COOLDOWN,now);enqueueMail('otp',{to:email,subject:'PAKMOO verification code',text:`Your verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.`});db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
}
export function verifyOtp(email,code,purpose='reset',now=Date.now()){
 const db=database();db.exec('BEGIN IMMEDIATE');try{const row=db.prepare('SELECT * FROM otp_tokens WHERE email=? AND purpose=? ORDER BY created_at DESC LIMIT 1').get(String(email).trim().toLowerCase(),purpose);if(!row||row.consumed_at||row.expires_at<=now||row.attempts>=OTP_ATTEMPTS){db.exec('COMMIT');return null;}
 const expected=Buffer.from(row.code_hash,'hex'),actual=Buffer.from(keyedHash(row.id+':'+String(code)),'hex');if(!timingSafeEqual(expected,actual)){db.prepare('UPDATE otp_tokens SET attempts=attempts+1 WHERE id=?').run(row.id);db.exec('COMMIT');return null;}
 db.prepare('UPDATE otp_tokens SET consumed_at=? WHERE id=?').run(now,row.id);const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO reset_grants(token_hash,admin_id,otp_id,purpose,expires_at) VALUES(?,?,?,?,?)').run(digest(token),row.admin_id,row.id,purpose,now+300000);db.exec('COMMIT');return token;
 }catch(e){db.exec('ROLLBACK');throw e;}
}
export function resetPassword(token,password,now=Date.now()){
 const hash=passwordHash(password),db=database();db.exec('BEGIN IMMEDIATE');try{const grant=db.prepare("SELECT * FROM reset_grants WHERE token_hash=? AND purpose='reset' AND consumed_at IS NULL AND expires_at>?").get(digest(token),now);if(!grant){db.exec('COMMIT');return false;}db.prepare("UPDATE admins SET password_hash=?,salt='',hash_scheme='bcrypt' WHERE id=?").run(hash,grant.admin_id);db.prepare('DELETE FROM sessions WHERE admin_id=?').run(grant.admin_id);db.prepare('UPDATE reset_grants SET consumed_at=? WHERE admin_id=?').run(now,grant.admin_id);const admin=db.prepare('SELECT email FROM admins WHERE id=?').get(grant.admin_id);enqueueMail('password-changed',{to:admin.email,subject:'Your PAKMOO password was changed',text:'Your administrator password was changed. Contact the site owner if you did not make this change.'});audit({id:grant.admin_id},'password.reset','admin',grant.admin_id);db.exec('COMMIT');return true;}catch(e){db.exec('ROLLBACK');throw e;}
}
