import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,createHash} from 'node:crypto';
const directory=fs.mkdtempSync(path.resolve('.data/page-delete-test-'));
const source=new DatabaseSync(path.resolve('.data/website.sqlite'),{readOnly:true});
source.exec("VACUUM INTO '"+path.join(directory,'website.sqlite').replaceAll("'","''")+"'");source.close();
const db=new DatabaseSync(path.join(directory,'website.sqlite'));
const owner=db.prepare("SELECT id FROM admins WHERE email=? AND active=1").get('juhityagi09@gmail.com');assert.ok(owner);
const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'),owner.id,Date.now()+3600000);
const base='http://127.0.0.1:3109';let child;
async function start(){child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3109'],{cwd:process.cwd(),env:{...process.env,DATA_DIRECTORY:directory,SITE_URL:base},windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.on('data',()=>{});child.stderr.on('data',()=>{});for(let i=0;i<120;i++){if(child.exitCode!==null)throw Error('Test server exited');try{if([200,401].includes((await fetch(base+'/api/auth/session')).status))return;}catch{}await new Promise(r=>setTimeout(r,500));}throw Error('Test server did not start');}
async function stop(){if(child&&child.exitCode===null){const c=child;await new Promise(resolve=>{c.once('exit',resolve);c.kill();});}}
async function request(route,method='GET',authenticated=true){return fetch(base+route,{method,headers:{Origin:base,...(authenticated?{Cookie:'pakmoo_session='+token}:{})},redirect:'manual',signal:AbortSignal.timeout(60000)});}
try{await start();const records=(await(await request('/api/admin/content?kind=page')).json()).records;const globalPage=records.find(r=>r.key==='global');assert.ok(globalPage);const editor=db.prepare("INSERT INTO admins(username,password_hash,salt,email,display_name,role,active,hash_scheme) VALUES('page-delete-editor','unused','','page-delete-editor@example.com','Test editor','editor',1,'bcrypt')").run();const editorToken=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(createHash('sha256').update(editorToken).digest('hex'),Number(editor.lastInsertRowid),Date.now()+3600000);const denied=await fetch(base+'/api/admin/content/'+globalPage.id,{method:'DELETE',headers:{Origin:base,Cookie:'pakmoo_session='+editorToken}});assert.equal(denied.status,403);const pages=records.filter(r=>['about','home'].includes(r.key));assert.equal(pages.length,2);
for(const page of pages){assert.equal((await request('/api/admin/content/'+page.id,'DELETE',false)).status,401);const r=await request('/api/admin/content/'+page.id,'DELETE');assert.equal(r.status,200,await r.text());assert.equal((await request('/api/admin/content/'+page.id)).status,404);assert.equal((await request(page.key==='home'?'/':'/'+page.key,'GET',false)).status,404);assert.ok(db.prepare("SELECT 1 FROM cms_seed_ledger WHERE kind='page' AND record_key=?").get(page.key));}
await stop();await start();for(const page of pages){assert.equal((await request(page.key==='home'?'/':'/'+page.key,'GET',false)).status,404);assert.equal(db.prepare('SELECT count(*) n FROM content_records WHERE id=?').get(page.id).n,0);}
assert.equal((await request('/admin/pages')).status,200);assert.equal((await request('/products','GET',false)).status,200);assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
console.log('PASS: authenticated core-page deletion, anonymous deletion blocked, deleted URLs return 404, restart does not restore deleted pages, other pages and admin remain accessible.');
}finally{await stop();db.close();}
