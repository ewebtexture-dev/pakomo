import assert from 'node:assert/strict';
import fs from 'node:fs';
import {isSafeImagePlaceholder} from '../src/cms/image-placeholder.js';
for(const format of ['jpeg','png','webp','avif'])assert.equal(isSafeImagePlaceholder('data:image/'+format+';base64,AA=='),true,format);
for(const value of ['data:image/svg+xml;base64,PHN2Zz4=','data:text/html;base64,PHNjcmlwdD4=','javascript:alert(1)','data:image/png;base64,AA==;javascript:alert(1)','data:image/png;base64,'+'A'.repeat(3000),'data:image/png;base64,AA==\n<script>'])assert.equal(isSafeImagePlaceholder(value),false);
const base='http://localhost:3000',s=fs.readFileSync('.data/local-admin.txt','utf8');let cookie='';
async function request(path,method='GET',body){return fetch(base+path,{method,headers:{cookie,Origin:base,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});}
async function json(path,method='GET',body,status=200){const r=await request(path,method,body),d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d;}
const login=await request('/api/auth/login','POST',{username:s.match(/Username: (.+)/)[1].trim(),password:s.match(/Password: (.+)/)[1].trim()});assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];
const token='url-regression-'+Date.now(),ids=[];let updated=0;
try{
 // Exercise the reported failure through the same page update route.
 const page=(await json('/api/admin/content?kind=page')).records.find(r=>r.key==='home');let current=page;
 try{for(const format of ['jpeg','png','webp','avif']){current=(await json('/api/admin/content/'+page.id,'PUT',{...current,status:'draft',payload:{...page.payload,placeholderRegression:{image:{src:'/image-placeholder.svg',blurDataURL:'data:image/'+format+';base64,AA=='}}}})).record;updated++;}
 for(const [field,value]of [['image','data:image/png;base64,AA=='],['href','javascript:alert(1)'],['logo','data:image/svg+xml;base64,PHN2Zz4='],['src','vbscript:alert(1)'],['blurDataURL','data:text/html;base64,PHNjcmlwdD4=']])await json('/api/admin/content/'+page.id,'PUT',{...current,status:'draft',payload:{...page.payload,placeholderRegression:{[field]:value}}},422);
 }finally{await json('/api/admin/content/'+page.id,'PUT',{...page,version:current.version});}
 // Optional private snapshot captures the real legacy payloads without committing business data.
 if(fs.existsSync('.data/safe-url-live-records.json')){const records=JSON.parse(fs.readFileSync('.data/safe-url-live-records.json','utf8'));
 const legacy=value=>value&&typeof value==='object'&&Object.entries(value).some(([key,v])=>key==='blurDataURL'&&typeof v==='string'&&/^data:image\/(jpeg|png|avif);/.test(v)||legacy(v));
 const pages=(await json('/api/admin/content?kind=page')).records;
 for(const record of records.filter(r=>legacy(r.payload))){if(record.kind==='page'){const original=pages.find(p=>p.key===record.key);let saved;try{saved=(await json('/api/admin/content/'+original.id,'PUT',{...original,status:'draft',payload:record.payload})).record;updated++;}finally{if(saved)await json('/api/admin/content/'+original.id,'PUT',{...original,version:saved.version});}}else{let row=(await json('/api/admin/content','POST',{...record,key:token+'-'+updated,slug:token+'-'+updated,status:'draft'},201)).record;ids.push(row.id);row=(await json('/api/admin/content/'+row.id,'PUT',{...row,title:row.title+' saved',status:'draft'})).record;updated++;await json('/api/admin/content/'+row.id,'DELETE');ids.pop();}}
 }
 console.log('PASS: '+updated+' legacy/raster placeholder update cases; data image URLs, SVG, HTML and script URLs still blocked; local records restored.');
}finally{for(const id of ids)await request('/api/admin/content/'+id,'DELETE');await request('/api/auth/logout','POST');}
