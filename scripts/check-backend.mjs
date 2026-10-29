import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const base='http://localhost:3000';
const details=fs.readFileSync('.data/local-admin.txt','utf8');
const username=details.match(/Username: (.+)/)[1].trim(), password=details.match(/Password: (.+)/)[1].trim();
let cookie='',postId='',uploadUrl='';
const slug='local-review-'+Date.now();
async function request(url,{method='GET',body,authenticated=true,origin=base,...rest}={}) {
  const headers={...(authenticated&&cookie?{Cookie:cookie}:{}),...(method!=='GET'?{Origin:origin}:{}),...(body&&!(body instanceof FormData)?{'Content-Type':'application/json'}:{})};
  return fetch(base+url,{method,headers,...(body?{body:body instanceof FormData?body:JSON.stringify(body)}:{}),...rest});
}
async function expectJson(response,status){assert.equal(response.status,status,await response.clone().text());return response.json();}
try {
  assert.equal((await request('/api/admin/posts',{authenticated:false})).status,401);
  assert.equal((await request('/admin/blogs',{authenticated:false,redirect:'manual'})).status,307);
  assert.equal((await request('/api/auth/login',{method:'POST',body:{username,password},origin:'http://foreign.example'})).status,403);
  assert.equal((await request('/api/auth/login',{method:'POST',body:{username,password:'wrong-password'}})).status,401);
  const signIn=await request('/api/auth/login',{method:'POST',body:{username,password}});
  assert.equal(signIn.status,200,await signIn.clone().text());
  const setCookie=signIn.headers.get('set-cookie');
  assert.match(setCookie,/HttpOnly/i);assert.match(setCookie,/SameSite=lax/i);
  cookie=setCookie.split(';')[0];
  assert.equal((await request('/api/auth/session')).status,200);
  const availableAuthors=(await expectJson(await request('/api/admin/authors'),200)).authors;
  const authorId=availableAuthors.find(author=>author.active)?.id;
  assert.ok(authorId,'An active author must be available.');
  const invalidFile=new FormData();invalidFile.set('image',new Blob(['<svg onload="alert(1)"></svg>'],{type:'image/svg+xml'}),'fake.svg');
  assert.equal((await request('/api/admin/uploads',{method:'POST',body:invalidFile})).status,422);
  const image=new FormData();image.set('image',new Blob([fs.readFileSync('assets/Unsplash/blog-1.jpg')],{type:'image/jpeg'}),'featured.jpg');
  uploadUrl=(await expectJson(await request('/api/admin/uploads',{method:'POST',body:image}),201)).url;
  assert.equal((await request(uploadUrl,{authenticated:false})).headers.get('content-type'),'image/jpeg');
  const payload={title:'Local backend verification',slug,excerpt:'A temporary article used to verify the local backend.',content:'<h2>Verification heading</h2><p>Local review content is rendered on the server.</p><script>alert(1)</script><a href="javascript:alert(2)">Unsafe link</a>',author_id:authorId,category:'testing_standards',image_url:uploadUrl,image_alt:'Testing instruments',meta_title:'Verification SEO title',meta_description:'Verification search description.',status:'draft',noindex:false};
  const draft=(await expectJson(await request('/api/admin/posts',{method:'POST',body:payload}),201)).post;postId=draft.id;
  assert.doesNotMatch(draft.content,/<script|javascript:/i);
  assert.equal((await request('/blog/'+slug,{authenticated:false})).status,404);
  assert.equal((await request('/admin/preview/'+postId)).status,200);
  assert.equal((await (await request('/api/blog/posts')).json()).posts.some(p=>p.slug===slug),false);
  assert.equal((await request('/api/admin/posts',{method:'POST',body:payload})).status,409);
  assert.equal((await request('/api/admin/posts/'+postId,{method:'PUT',body:{...payload,status:'published',image_alt:''}})).status,422);
  await expectJson(await request('/api/admin/posts/'+postId,{method:'PUT',body:{...payload,status:'published'}}),200);
  assert.equal((await (await request('/api/blog/posts')).json()).posts.some(p=>p.slug===slug),true);
  const html=await (await request('/blog/'+slug,{authenticated:false})).text();
  assert.match(html,/Verification SEO title/);assert.match(html,/Verification search description\./);assert.match(html,/Local review content is rendered on the server/);
  assert.match(html,/rel="canonical"[^>]+/);assert.match(html,/og:type[^>]+article/);assert.match(html,/BlogPosting/);assert.match(html,/BreadcrumbList/);
  assert.match(await (await request('/blog')).text(),/Local backend verification/);
  assert.match(await (await request('/sitemap.xml')).text(),new RegExp(slug));
  assert.match(await (await request('/robots.txt')).text(),/Disallow: \/admin/);
  await expectJson(await request('/api/admin/posts/'+postId,{method:'PUT',body:{...payload,status:'published',noindex:true}}),200);
  assert.doesNotMatch(await (await request('/sitemap.xml')).text(),new RegExp(slug));
  assert.match(await (await request('/blog/'+slug)).text(),/noindex/);
  const nextSlug=slug+'-updated';
  await expectJson(await request('/api/admin/posts/'+postId,{method:'PUT',body:{...payload,slug:nextSlug,status:'published'}}),200);
  const old=await request('/blog/'+slug,{redirect:'manual'});assert.equal(old.status,308);assert.ok(old.headers.get('location').endsWith('/blog/'+nextSlug));
  await expectJson(await request('/api/admin/posts/'+postId,{method:'PUT',body:{...payload,slug:nextSlug,status:'draft'}}),200);
  assert.equal((await request('/blog/'+nextSlug)).status,200);
  await expectJson(await request('/api/admin/posts/'+postId,{method:'PUT',body:{action:'unpublish'}}),200);
  assert.equal((await request('/blog/'+nextSlug)).status,404);
  await expectJson(await request('/api/admin/posts/'+postId,{method:'DELETE'}),200);postId='';
  assert.equal((await request('/blog/'+nextSlug)).status,404);
  const oldCookie=cookie;
  await expectJson(await request('/api/auth/logout',{method:'POST'}),200);
  cookie=oldCookie;assert.equal((await request('/api/admin/posts')).status,401);
  cookie='pakmoo_session='+'a'.repeat(64);assert.equal((await request('/api/admin/posts')).status,401);
  console.log('PASS: authentication, CSRF, session revocation, image validation/upload, draft privacy, preview, publish, server-rendered SEO, sitemap/noindex, slug redirects, unpublish, edit, delete, persistent storage. Test content removed.');
} finally {
  if(postId){const signIn=await request('/api/auth/login',{method:'POST',body:{username,password}});if(signIn.ok){cookie=signIn.headers.get('set-cookie').split(';')[0];await request('/api/admin/posts/'+postId,{method:'DELETE'});}}
  if(uploadUrl && /^\/media\/[a-f0-9-]{36}\.jpg$/.test(uploadUrl))fs.rmSync(path.join('.data/uploads',path.basename(uploadUrl)),{force:true});
}
