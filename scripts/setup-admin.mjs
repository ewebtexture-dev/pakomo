import fs from 'node:fs';
import { randomBytes, scryptSync } from 'node:crypto';
import { database } from '../src/server/database.js';
const username=(process.env.ADMIN_USERNAME || 'pakmoo_admin').toLowerCase();
const db=database();
const existing=db.prepare('SELECT id FROM admins WHERE username=?').get(username);
if(existing && !process.argv.includes('--reset')){console.log('Admin already exists. Credentials are unchanged. Use --reset to rotate the password.');process.exit(0);}
const password=process.env.ADMIN_PASSWORD || randomBytes(15).toString('base64url');
if(password.length<12)throw Error('Use a password with at least 12 characters.');
const salt=randomBytes(24).toString('hex');
const hash=scryptSync(password,salt,64).toString('hex');
if(existing){db.prepare("UPDATE admins SET password_hash=?,salt=?,hash_scheme='scrypt' WHERE id=?").run(hash,salt,existing.id);db.prepare('DELETE FROM sessions WHERE admin_id=?').run(existing.id);}
else db.prepare('INSERT INTO admins(username,password_hash,salt) VALUES(?,?,?)').run(username,hash,salt);
fs.mkdirSync('.data',{recursive:true});
fs.writeFileSync('.data/.htaccess','Require all denied\n');
fs.writeFileSync('.data/local-admin.txt','Local admin URL: http://localhost:3000/login\nUsername: '+username+'\nPassword: '+password+'\n',{mode:0o600});
console.log('Local admin created. Sign-in details are in .data/local-admin.txt (excluded from Git).');
