// Run once on the existing Hostinger application before deploying release 2910.
// Reads no account credentials and never changes administrator passwords.
import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes} from 'node:crypto';
const domainRoot='/home/u835816219/domains/pakmoo.in';
const active=path.join(domainRoot,'hbuilds/current/nodejs/.data');
const target=path.join(domainRoot,'private-data');
if(process.platform!=='linux'||!fs.existsSync(path.join(active,'website.sqlite')))throw Error('Run this only on the existing pakmoo.in Hostinger deployment.');
fs.mkdirSync(target,{recursive:true,mode:0o700});
const keyFile=path.join(target,'.cms-secret');
if(!fs.existsSync(keyFile))fs.writeFileSync(keyFile,randomBytes(48).toString('hex'),{mode:0o600,flag:'wx'});
const marker=path.join(target,'.migration-2910-complete');
if(fs.existsSync(marker)){console.log('Persistent data migration already completed.');process.exit(0);}
if(fs.existsSync(path.join(target,'website.sqlite')))throw Error('Persistent database already exists without migration marker. Inspect it before continuing.');
const source=new DatabaseSync(path.join(active,'website.sqlite'));
source.exec('PRAGMA busy_timeout=15000');
const escaped=value=>"'"+value.replaceAll("'","''")+"'";
const backup=path.join(target,'pre-2910-backup.sqlite');
if(fs.existsSync(backup))throw Error('A prior backup exists. Inspect the previous migration attempt.');
source.exec('VACUUM INTO '+escaped(backup));
const copy=new DatabaseSync(backup,{readOnly:true});
if(copy.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('Backup integrity check failed.');
const counts={};for(const table of ['admins','posts','authors'])counts[table]=copy.prepare('SELECT count(*) n FROM '+table).get().n;
copy.close();source.close();
fs.copyFileSync(backup,path.join(target,'website.sqlite'),fs.constants.COPYFILE_EXCL);
if(fs.existsSync(path.join(active,'uploads')))fs.cpSync(path.join(active,'uploads'),path.join(target,'uploads'),{recursive:true,errorOnExist:true,force:false});
fs.chmodSync(path.join(target,'website.sqlite'),0o600);fs.chmodSync(backup,0o600);
fs.writeFileSync(marker,JSON.stringify({migratedAt:new Date().toISOString(),counts,source:active})+'\n',{mode:0o600,flag:'wx'});
console.log('Persistent SQLite backup and uploads copied. Integrity check passed. Counts: '+JSON.stringify(counts));
