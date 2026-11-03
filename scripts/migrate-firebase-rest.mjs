// REST migration: the source Web API key can read only data allowed by source rules.
// Destination authentication is supplied by a private module exporting api(url, options).
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash, randomUUID} from 'node:crypto';
import nextEnv from '@next/env';
import {firebaseObjectKey, rewriteFirebaseReferences} from '../src/cms/firebase-migration.js';

const args=Object.fromEntries(process.argv.slice(2).map(arg=>{const i=arg.indexOf('=');return i<0?[arg.replace(/^--/,''),true]:[arg.slice(2,i),arg.slice(i+1)];}));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,sort(x)])):v;
const fieldHash=v=>hash(JSON.stringify(sort(v)));
async function rest(url,options={}){const r=await fetch(url,{...options,signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`Source REST request failed: HTTP ${r.status} (${new URL(url).pathname})`);return r.json();}
async function bytes(url){const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('File read failed: HTTP '+r.status);const parts=[];let size=0;for await(const part of r.body){size+=part.length;if(size>128*1024*1024)throw Error('File exceeds 128 MB; review before copying');parts.push(part);}return Buffer.concat(parts);}
async function main(){
  if(args['write-map'])throw Error('The active website is Hostinger-only. Omit --write-map; legacy cloud exports stay in the private migration output.');
  if(args.apply!==undefined&&args.apply!==true)throw Error('Use --apply as a flag; omit it for a fetch-only run');
  nextEnv.loadEnvConfig(process.cwd(),false,{info(){},error(){}});
  const source=args['source-project'],target=args['target-project'],sourceBucket=args['source-bucket'],targetBucket=args['target-bucket'];
  if(!source||!target||source===target||!sourceBucket||!targetBucket||sourceBucket===targetBucket)throw Error('Provide distinct --source-project, --target-project, --source-bucket and --target-bucket');
  for(const id of [source,target])if(!/^[a-z][a-z0-9-]+$/.test(id))throw Error('Invalid project ID');
  const collections=String(args.collections||'products').split(',').filter(Boolean);if(collections.some(c=>!/^([A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+$/.test(c)||c.split('/').length%2!==1))throw Error('Invalid collection path');
  const key=args['source-config']?JSON.parse(fs.readFileSync(args['source-config'],'utf8')).apiKey:process.env.FIREBASE_SOURCE_API_KEY||process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if(!key)throw Error('Provide FIREBASE_SOURCE_API_KEY or --source-config (private Web config JSON)');
  const output=path.resolve(args.output||'.data/firebase-migration/'+new Date().toISOString().replace(/[:.]/g,'-'));
  if(!output.startsWith(path.resolve('.data')+path.sep))throw Error('Migration output must remain in private .data');
  fs.mkdirSync(path.join(output,'files'),{recursive:true});
  const report={sourceProject:source,targetProject:target,startedAt:new Date().toISOString(),applied:Boolean(args.apply),collections:[],discoveryDenied:false,files:[],documents:0,verifiedFiles:0,verifiedDocuments:0,limitations:[]};
  const save=()=>fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));save();
  const root=`https://firestore.googleapis.com/v1/projects/${source}/databases/(default)/documents`;
  const discovery=await fetch(root+':listCollectionIds?key='+encodeURIComponent(key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pageSize:1000}),signal:AbortSignal.timeout(60000)});
  if(discovery.ok){let data=await discovery.json();for(const c of data.collectionIds||[])if(!collections.includes(c))collections.push(c);while(data.nextPageToken){data=await rest(root+':listCollectionIds?key='+encodeURIComponent(key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pageSize:1000,pageToken:data.nextPageToken})});for(const c of data.collectionIds||[])if(!collections.includes(c))collections.push(c);}}
  else {report.discoveryDenied=true;report.limitations.push('Source rules/IAM deny collection discovery. Only explicitly supplied readable collections and discovered Storage objects can be migrated; Auth users, protected collections, rules and indexes are not exported by a Web API key.');}
  const documents=[];
  for(const collection of collections){let pageToken,count=0;do{const url=new URL(root+'/'+collection);url.searchParams.set('key',key);url.searchParams.set('pageSize','1000');if(pageToken)url.searchParams.set('pageToken',pageToken);const data=await rest(url);documents.push(...data.documents||[]);count+=(data.documents||[]).length;pageToken=data.nextPageToken;}while(pageToken);report.collections.push({path:collection,count});}
  report.documents=documents.length;fs.writeFileSync(path.join(output,'source-documents.json'),JSON.stringify(documents,null,2));
  const objects=new Map();let pageToken;
  do{const url=new URL(`https://firebasestorage.googleapis.com/v0/b/${sourceBucket}/o`);url.searchParams.set('maxResults','1000');if(pageToken)url.searchParams.set('pageToken',pageToken);const listing=await rest(url);for(const item of listing.items||[])objects.set(sourceBucket+'/'+item.name,item);pageToken=listing.nextPageToken;}while(pageToken);
  fs.writeFileSync(path.join(output,'source-storage-listing.json'),JSON.stringify([...objects.values()],null,2));
  // Include token URLs referenced by Firestore, even if a listing omits an object.
  const knownUrls=new Map();function scan(v){if(typeof v==='string'){const k=firebaseObjectKey(v);if(k){knownUrls.set(k,v);if(!objects.has(k))objects.set(k,{name:k.slice(k.indexOf('/')+1)});}}else if(Array.isArray(v))v.forEach(scan);else if(v&&typeof v==='object')Object.values(v).forEach(scan);}scan(documents);
  const token=process.env[String(args['access-token-env']||'FIREBASE_TARGET_ACCESS_TOKEN')];
  const {api}=args['auth-module']?await import(pathToFileURL(path.resolve(args['auth-module'])).href):{api:token?async(url,{method='GET',body,headers={},raw=false}={})=>{const response=await fetch(url,{method,headers:{Authorization:'Bearer '+token,...(body&&!(body instanceof Uint8Array)?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:body instanceof Uint8Array?body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(60000)});return{ok:response.ok,status:response.status,data:raw?Buffer.from(await response.arrayBuffer()):await response.json().catch(()=>({}))};}:null};
  if(args.apply&&!api)throw Error('--apply requires FIREBASE_TARGET_ACCESS_TOKEN or a private --auth-module exporting authenticated destination api()');
  if(args.apply){const bill=await api(`https://cloudbilling.googleapis.com/v1/projects/${target}/billingInfo`);if(!bill.ok||!bill.data.billingEnabled)throw Error('Destination billing is not enabled');const bucket=await api(`https://storage.googleapis.com/storage/v1/b/${targetBucket}`);if(!bucket.ok)throw Error('Destination bucket does not exist');if(bucket.data.projectNumber){const project=await api(`https://firebase.googleapis.com/v1beta1/projects/${target}`);if(!project.ok||String(project.data.projectNumber)!==String(bucket.data.projectNumber))throw Error('Destination bucket belongs to a different project');}}
  const urls=new Map(),queue=[...objects.entries()];let processed=0;
  async function worker(){while(queue.length){const [object,item]=queue.shift(),name=item.name;const tokens=Array.isArray(item.downloadTokens)?item.downloadTokens:String(item.downloadTokens||'').split(',');const oldUrl=knownUrls.get(object)||`https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(sourceBucket)}/o/${encodeURIComponent(name)}?alt=media`+(tokens[0]?'&token='+encodeURIComponent(tokens[0]):'');
    const buffer=await bytes(oldUrl),sha256=hash(buffer),file=hash(object)+'.bin';fs.writeFileSync(path.join(output,'files',file),buffer);
    const entry={source:object,name,file,bytes:buffer.length,sha256,contentType:item.contentType||'application/octet-stream'};
    if(args.apply){const metadataUrl=`https://storage.googleapis.com/storage/v1/b/${targetBucket}/o/${encodeURIComponent(name)}`;let existing=await api(metadataUrl),token;
      if(existing.ok){const current=await api(metadataUrl+'?alt=media',{raw:true});if(!current.ok||hash(current.data)!==sha256)throw Error('Destination file conflict: '+name);token=existing.data.metadata?.firebaseStorageDownloadTokens?.split(',')[0];if(!token){token=randomUUID();const patched=await api(metadataUrl,{method:'PATCH',body:{metadata:{...existing.data.metadata,firebaseStorageDownloadTokens:token}}});if(!patched.ok)throw Error('Could not assign destination image URL');}}
      else if(existing.status===404){token=randomUUID();const boundary='firebase-migration-'+randomUUID(),metadata={name,contentType:entry.contentType,cacheControl:item.cacheControl||'public,max-age=3600',metadata:{firebaseStorageDownloadTokens:token,migrationSource:object,migrationSha256:sha256}};const body=Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${entry.contentType}\r\n\r\n`),buffer,Buffer.from(`\r\n--${boundary}--\r\n`)]);const uploaded=await api(`https://storage.googleapis.com/upload/storage/v1/b/${targetBucket}/o?uploadType=multipart&ifGenerationMatch=0`,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});if(!uploaded.ok)throw Error('Destination upload failed: '+name+' HTTP '+uploaded.status);}
      else throw Error('Could not inspect destination object: HTTP '+existing.status);
      const url=`https://firebasestorage.googleapis.com/v0/b/${targetBucket}/o/${encodeURIComponent(name)}?alt=media&token=${token}`;if(hash(await bytes(url))!==sha256)throw Error('Public destination checksum failed: '+name);urls.set(object,url);entry.targetUrl=url;report.verifiedFiles++;
    }
    report.files.push(entry);processed++;save();if(processed%20===0)console.log(JSON.stringify({filesProcessed:processed,total:objects.size}));}}
  await Promise.all([worker(),worker(),worker(),worker()]);
  if(args.apply){
    const baseline=args.baseline?JSON.parse(fs.readFileSync(args.baseline,'utf8')):documents;const previous=new Map(baseline.map(d=>[d.name.split('/documents/')[1],d]));const writes=[],expected=[];
    for(const doc of documents){const relative=doc.name.split('/documents/')[1],name=`projects/${target}/databases/(default)/documents/${relative}`,fields=rewriteFirebaseReferences(doc.fields,urls);const current=await api('https://firestore.googleapis.com/v1/'+name);expected.push({name,fields});if(current.ok&&fieldHash(current.data.fields)===fieldHash(fields))continue;if(current.ok&&fieldHash(current.data.fields)!==fieldHash(doc.fields)&&fieldHash(current.data.fields)!==fieldHash(previous.get(relative)?.fields))throw Error('Destination document conflict: '+relative);if(!current.ok&&current.status!==404)throw Error('Destination document read failed');writes.push({update:{name,fields},currentDocument:current.ok?{updateTime:current.data.updateTime}:{exists:false}});}
    for(let i=0;i<writes.length;i+=400){const result=await api(`https://firestore.googleapis.com/v1/projects/${target}/databases/(default)/documents:commit`,{method:'POST',body:{writes:writes.slice(i,i+400)}});if(!result.ok)throw Error('Firestore import failed: HTTP '+result.status);}
    for(const doc of expected){const check=await api('https://firestore.googleapis.com/v1/'+doc.name);if(!check.ok||fieldHash(check.data.fields)!==fieldHash(doc.fields))throw Error('Destination document verification failed');report.verifiedDocuments++;}report.importedOrUpdatedDocuments=writes.length;
    const mapping={sourceProject:source,targetProject:target,sourceBucket,targetBucket,verifiedAt:new Date().toISOString(),files:report.files.map(({source,targetUrl,sha256,bytes})=>({source,targetUrl,sha256,bytes}))};fs.writeFileSync(path.join(output,'asset-map.json'),JSON.stringify(mapping,null,2));
  }
  report.finishedAt=new Date().toISOString();save();console.log(JSON.stringify({documents:report.documents,files:report.files.length,verifiedFiles:report.verifiedFiles,verifiedDocuments:report.verifiedDocuments,sourceDiscoveryDenied:report.discoveryDenied,output,applied:report.applied}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
