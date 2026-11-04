import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,createHash} from 'node:crypto';
const directory=fs.mkdtempSync(path.resolve('.data/page-create-test-'));
const source=new DatabaseSync(path.resolve('.data/website.sqlite'),{readOnly:true});
source.exec("VACUUM INTO '"+path.join(directory,'website.sqlite').replaceAll("'","''")+"'");source.close();
const db=new DatabaseSync(path.join(directory,'website.sqlite'));
const owner=db.prepare("SELECT id FROM admins WHERE email=? AND active=1").get('juhityagi09@gmail.com');assert.ok(owner);
const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'),owner.id,Date.now()+3600000);
const base='http://127.0.0.1:3109';let child;
async function start(){child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3109'],{cwd:process.cwd(),env:{...process.env,DATA_DIRECTORY:directory,SITE_URL:base},windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.on('data',()=>{});child.stderr.on('data',()=>{});for(let i=0;i<120;i++){if(child.exitCode!==null)throw Error('Test server exited');try{if([200,401].includes((await fetch(base+'/api/auth/session')).status))return;}catch{}await new Promise(r=>setTimeout(r,500));}throw Error('Test server did not start');}
async function stop(){if(child&&child.exitCode===null){const c=child;await new Promise(resolve=>{c.once('exit',resolve);c.kill();});}}
async function request(route,method='GET',authenticated=true,body){return fetch(base+route,{method,...(body?{body:JSON.stringify(body)}:{}),headers:{Origin:base,'Content-Type':'application/json',...(authenticated?{Cookie:'pakmoo_session='+token}:{})},redirect:'manual',signal:AbortSignal.timeout(60000)});}
try{await start();const records=(await(await request('/api/admin/content?kind=page')).json()).records;const globalPage=records.find(r=>r.key==='global');assert.ok(globalPage);const editor=db.prepare("INSERT INTO admins(username,password_hash,salt,email,display_name,role,active,hash_scheme) VALUES('page-delete-editor','unused','','page-delete-editor@example.com','Test editor','editor',1,'bcrypt')").run();const editorToken=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(createHash('sha256').update(editorToken).digest('hex'),Number(editor.lastInsertRowid),Date.now()+3600000);const denied=await fetch(base+'/api/admin/content/'+globalPage.id,{method:'DELETE',headers:{Origin:base,Cookie:'pakmoo_session='+editorToken}});assert.equal(denied.status,403);
async function savePage(data,id){const r=await request('/api/admin/content'+(id?'/'+id:''),id?'PUT':'POST',true,data);assert.equal(r.status,id?200:201,await r.clone().text());return (await r.json()).record;}
let custom=await savePage({kind:'page',key:'new-page-check',slug:'new-page-check',title:'New page check',status:'draft',enabled:true,payload:{title:'New page check',body:'<p>Custom public page body.</p>',seo:{title:'New page SEO'}}});
assert.equal((await request('/new-page-check','GET',false)).status,404);
custom=await savePage({...custom,status:'published'},custom.id);
let publicPage=await request('/new-page-check','GET',false);assert.equal(publicPage.status,200);assert.ok((await publicPage.text()).includes('Custom public page body.'));
assert.ok((await(await request('/sitemap.xml','GET',false)).text()).includes('/new-page-check'));
custom=await savePage({...custom,slug:'new-page-renamed'},custom.id);assert.equal((await request('/new-page-check','GET',false)).status,301);assert.equal((await request('/new-page-renamed','GET',false)).status,200);
const collision=await request('/api/admin/content','POST',true,{...custom,key:'invalid-page',slug:'admin'});assert.equal(collision.status,422);
const reservedKey=await request('/api/admin/content','POST',true,{...custom,key:'admin',slug:'admin'});assert.equal(reservedKey.status,422);
assert.equal((await request('/api/admin/content/'+custom.id,'DELETE')).status,200);
await savePage({kind:'gallery',key:'test-gallery-album',slug:'test-gallery-album',title:'Test gallery album',status:'published',enabled:true,payload:{title:'Test gallery album',image:'/hosted-assets/'+fs.readdirSync('public/hosted-assets')[0],alt:'Test gallery image'}});let gallery=records.find(p=>p.key==='gallery');assert.ok(gallery);const originalGallery={...gallery};
gallery=await savePage({...gallery,status:'draft',slug:'gallery-url-check'},gallery.id);assert.equal((await request('/gallery','GET',false)).status,200);assert.equal((await request('/gallery-url-check','GET',false)).status,404);
gallery=await savePage({...gallery,status:'published'},gallery.id);assert.equal((await request('/gallery','GET',false)).status,301);const renamedGallery=await request('/gallery-url-check','GET',false);assert.equal(renamedGallery.status,200);assert.ok((await renamedGallery.text()).includes(originalGallery.payload.galleryContent?.heading||'Precision, in every picture'));assert.equal((await(await request('/api/redirects/resolve?path=%2Fgallery-url-check','GET',false)).json()).rewrite,'/gallery');
gallery=await savePage({...gallery,slug:originalGallery.slug},gallery.id);assert.equal((await request('/gallery','GET',false)).status,200);assert.equal((await request('/gallery-url-check','GET',false)).status,301);
assert.equal((await request('/api/admin/content/'+gallery.id,'DELETE')).status,200);
gallery=await savePage({...originalGallery,slug:'recreated-gallery',status:'published'});assert.equal((await request('/recreated-gallery','GET',false)).status,200);assert.equal((await request('/gallery','GET',false)).status,301);
for(const module of ['pages',...['products','categories','applications','standards','clients','testimonials','services','gallery','blog-categories'].map(k=>'catalog/'+k)]){const route='/admin/'+module;const listing=await request(route);assert.equal(listing.status,200,route);assert.ok((await listing.text()).includes(route+'/new'),'Missing Add link '+route);assert.equal((await request(route+'/new')).status,200,route+'/new');}
const pages=records.filter(r=>['about','home'].includes(r.key));assert.equal(pages.length,2);
for(const page of pages){assert.equal((await request('/api/admin/content/'+page.id,'DELETE',false)).status,401);const r=await request('/api/admin/content/'+page.id,'DELETE');assert.equal(r.status,200,await r.text());assert.equal((await request('/api/admin/content/'+page.id)).status,404);assert.equal((await request(page.key==='home'?'/':'/'+page.key,'GET',false)).status,404);assert.ok(db.prepare("SELECT 1 FROM cms_seed_ledger WHERE kind='page' AND record_key=?").get(page.key));}
await stop();await start();for(const page of pages){assert.equal((await request(page.key==='home'?'/':'/'+page.key,'GET',false)).status,404);assert.equal(db.prepare('SELECT count(*) n FROM content_records WHERE id=?').get(page.id).n,0);}
assert.equal((await request('/admin/pages')).status,200);assert.equal((await request('/products','GET',false)).status,200);assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
console.log('PASS: custom page creation and publication, reserved slug rejection, Gallery draft/public URL changes and redirects, Gallery recreation, authenticated core-page deletion, anonymous deletion blocked, deleted URLs return 404, restart does not restore deleted pages, other pages and admin remain accessible.');
}finally{await stop();db.close();}
