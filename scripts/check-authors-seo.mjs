import assert from 'node:assert/strict';
import fs from 'node:fs';
const base='http://localhost:3000';
const credentials=fs.readFileSync('.data/local-admin.txt','utf8');
let cookie='',authorId='',postId='';
async function request(path,{method='GET',body,auth=true,origin=base}={}) {return fetch(base+path,{method,headers:{...(auth&&cookie?{Cookie:cookie}:{}),...(method!=='GET'?{Origin:origin}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});}
async function data(response,status){assert.equal(response.status,status,await response.clone().text());return response.json();}
try {
 assert.equal((await request('/api/admin/authors',{auth:false})).status,401);
 const login=await request('/api/auth/login',{method:'POST',body:{username:credentials.match(/Username: (.+)/)[1].trim(),password:credentials.match(/Password: (.+)/)[1].trim()}});
 assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];
 const suffix=Date.now(),author={name:'Temporary Author '+suffix,slug:'temporary-author-'+suffix,job_title:'Testing Specialist',bio:'Biography retained in structured data.',website_url:'https://example.com/researcher',avatar_url:'',active:true};
 assert.equal((await request('/api/admin/authors',{method:'POST',body:author,origin:'https://other.example'})).status,403);
 assert.equal((await request('/api/admin/authors',{method:'POST',body:{...author,website_url:'javascript:alert(1)'}})).status,422);
 authorId=(await data(await request('/api/admin/authors',{method:'POST',body:author}),201)).author.id;
 assert.equal((await request('/api/admin/authors',{method:'POST',body:author})).status,409);
 const slug='rich-content-check-'+suffix;
 const post={title:'SEO testing article',slug,author_id:authorId,category:'quality_control',status:'published',excerpt:'A temporary article to check rich content and SEO.',content:'<h2>SEO testing</h2><p class="ql-align-center evil" style="color:red">Text with <strong>bold</strong> and <em>italic</em>.</p><ul><li>Testing item</li></ul><script>alert(1)</script>',image_url:'/favicon.ico',image_alt:'Testing image',meta_title:'SEO testing title',meta_description:'A search description for testing.',focus_keyword:'SEO testing',meta_keywords:'testing, instruments',og_title:'Social sharing title',og_description:'Social sharing description',og_image:'https://example.com/share.jpg',nofollow:true,noindex:false};
 const created=(await data(await request('/api/admin/posts',{method:'POST',body:post}),201)).post;postId=created.id;
 assert.equal(created.author_id,authorId);assert.equal(created.author,author.name);assert.equal(created.authorProfile.bio,author.bio);
 assert.match(created.content,/ql-align-center/);assert.doesNotMatch(created.content,/evil|style=|<script/);
 const html=await (await request('/blog/'+slug)).text();
 assert.ok(/name="keywords" content="testing,\s*instruments"/.test(html),'Topic keywords are present.');assert.ok(/property="og:title" content="Social sharing title"/.test(html),'Social title is present.');assert.ok(/name="twitter:description" content="Social sharing description"/.test(html),'Twitter description is present.');assert.ok(/index, nofollow/.test(html),'Nofollow is present.');assert.ok(html.includes('Biography retained in structured data'),'Author biography is in structured data.');assert.ok(html.includes('Testing Specialist'),'Author expertise is in structured data.');
 assert.equal((await request('/api/admin/authors/'+authorId,{method:'DELETE'})).status,409);
 const changed={...author,name:'Renamed Author '+suffix,active:false};
 await data(await request('/api/admin/authors/'+authorId,{method:'PUT',body:changed}),200);
 const reread=(await data(await request('/api/admin/posts/'+postId),200)).post;
 assert.equal(reread.author,changed.name,'Assigned author name is resolved from the profile.');
 assert.equal((await request('/api/admin/posts',{method:'POST',body:{...post,slug:slug+'-inactive'}})).status,422);
 await data(await request('/api/admin/posts/'+postId,{method:'PUT',body:{...post,title:'Updated article with existing inactive author'}}),200);
 const other=(await data(await request('/api/admin/authors'),200)).authors.find(item=>item.active && item.id!==authorId);
 assert.ok(other);
 const reassigned=(await data(await request('/api/admin/posts/'+postId,{method:'PUT',body:{...post,author_id:other.id}}),200)).post;
 assert.equal(reassigned.author_id,other.id);
 await data(await request('/api/admin/authors/'+authorId,{method:'DELETE'}),200);authorId='';
 await data(await request('/api/admin/posts/'+postId,{method:'DELETE'}),200);postId='';
 console.log('PASS: author CRUD, assignment/reassignment, inactive and assigned author protection, SEO/social metadata, rich HTML preservation and sanitisation.');
}finally {
 if(postId)await request('/api/admin/posts/'+postId,{method:'DELETE'});
 if(authorId)await request('/api/admin/authors/'+authorId,{method:'DELETE'});
 if(cookie)await request('/api/auth/logout',{method:'POST'});
}
