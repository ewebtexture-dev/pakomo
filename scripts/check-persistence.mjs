import fs from 'node:fs';
import assert from 'node:assert/strict';
const base='http://localhost:3000';
const stateFile='.data/restart-check.json';
if(process.argv[2]==='before') {
  const credentials=fs.readFileSync('.data/local-admin.txt','utf8');
  const login=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({username:credentials.match(/Username: (.+)/)[1].trim(),password:credentials.match(/Password: (.+)/)[1].trim()})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const created=await fetch(base+'/api/admin/posts',{method:'POST',headers:{'Content-Type':'application/json',Origin:base,Cookie:cookie},body:JSON.stringify({title:'Temporary persistence check',slug:'persistence-check-'+Date.now(),status:'draft'})});
  assert.equal(created.status,201);
  const {post}=await created.json();
  fs.writeFileSync(stateFile,JSON.stringify({cookie,id:post.id}));
  console.log('Temporary draft saved. Restart the local server, then run this script with after.');
} else if(process.argv[2]==='after') {
  const {cookie,id}=JSON.parse(fs.readFileSync(stateFile,'utf8'));
  const response=await fetch(base+'/api/admin/posts/'+id,{headers:{Cookie:cookie}});
  assert.equal(response.status,200);
  assert.equal((await response.json()).post.title,'Temporary persistence check');
  const deleted=await fetch(base+'/api/admin/posts/'+id,{method:'DELETE',headers:{Origin:base,Cookie:cookie}});
  assert.equal(deleted.status,200);
  await fetch(base+'/api/auth/logout',{method:'POST',headers:{Origin:base,Cookie:cookie}});
  fs.rmSync(stateFile);
  console.log('PASS: article and authenticated session survived a full server restart. Temporary draft removed.');
} else {throw Error('Use before or after.');}
