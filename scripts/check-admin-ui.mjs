import fs from 'node:fs';
import assert from 'node:assert/strict';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const tabs=await (await fetch('http://127.0.0.1:9222/json')).json();
const socket=new WebSocket(tabs.find(tab=>tab.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
let counter=0;const requests=new Map();
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const request=requests.get(message.id);requests.delete(message.id);message.error?request.reject(message.error):request.resolve(message.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++counter;requests.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
async function until(expression){for(let count=0;count<60;count++){if(await evaluate(expression))return;await wait(500);}throw Error('Timed out waiting for '+expression);}
async function navigate(url){await call('Page.navigate',{url:'http://localhost:3000'+url});await until('location.pathname === '+JSON.stringify(url));await until('document.readyState === "complete"');await wait(800);}
async function fill(selector,value){await evaluate(`(()=>{const element=document.querySelector(${JSON.stringify(selector)});if(!element)throw Error('Missing field');const prototype=element.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:element.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value').set.call(element,${JSON.stringify(value)});element.dispatchEvent(new Event(element.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);await wait(100);}
async function clickText(text){await evaluate(`(()=>{const button=[...document.querySelectorAll('button')].find(button=>button.textContent.trim()===${JSON.stringify(text)});if(!button)throw Error('Button not found');button.click();})()`);await wait(100);}
async function file(selector){const {root}=await call('DOM.getDocument');const {nodeId}=await call('DOM.querySelector',{nodeId:root.nodeId,selector});await call('DOM.setFileInputFiles',{nodeId,files:[process.cwd()+'\\assets\\Unsplash\\blog-1.jpg']});}
async function api(path,options={}){return evaluate(`fetch(${JSON.stringify(path)},${JSON.stringify(options)}).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error);return data;})`);}
const credentials=fs.readFileSync('.data/local-admin.txt','utf8');
const username=credentials.match(/Username: (.+)/)[1].trim(),password=credentials.match(/Password: (.+)/)[1].trim();
let postId='',authorId='';const uploaded=[];
try {
 await call('Page.enable');await call('Runtime.enable');await call('Network.enable');await call('Network.setCacheDisabled',{cacheDisabled:true});await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await navigate('/login');await until('Boolean(document.querySelector("form"))');
 await api('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
 await navigate('/admin');
 await navigate('/admin/authors/new');await until('Boolean(document.querySelector("#author-name"))');
 const suffix=Date.now(),name='UI Test Author '+suffix,slug='editor-ui-check-'+suffix;
 await fill('#author-name',name);await fill('#author-job','Testing Specialist');await fill('#author-bio','Author biography created through the admin interface.');await fill('#author-website','https://example.com/researcher');
 await file('#author-photo-file');await until('document.querySelector("#author-photo").value.startsWith("/media/")');uploaded.push(await evaluate('document.querySelector("#author-photo").value'));
 await evaluate('document.querySelector("form").requestSubmit()');await until('location.pathname === "/admin/authors"');
 authorId=(await api('/api/admin/authors')).authors.find(author=>author.name===name).id;
 await navigate('/admin/authors/'+authorId);await until('Boolean(document.querySelector("#author-bio"))');await fill('#author-bio','Updated biography through Edit Author.');await clickText('Save author');await until('location.pathname === "/admin/authors"');
 await navigate('/admin/addBlog');await until('Boolean(document.querySelector(".ql-editor"))');
 await fill('#title','Testing rich text workflow');await fill('#slug',slug);await fill('#excerpt','A temporary article verifying the new visual editor and author assignment.');await fill('#author_id',authorId);
 await clickText('Edit HTML source');await fill('textarea[aria-label="Article HTML source"]','<h2>Testing workflow</h2><p>Rich content with <strong>bold</strong> text and an inline image.</p>');await clickText('Apply HTML & return to editor');await until('Boolean(document.querySelector(".ql-editor"))');
 await evaluate('(()=>{const editor=document.querySelector(".ql-editor");editor.focus();const range=document.createRange();range.selectNodeContents(editor);range.collapse(false);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);})()');
 await call('Input.insertText',{text:' Browser typing works.'});await wait(300);
 assert.equal(await evaluate('document.querySelector(".ql-editor").innerText.includes("Browser typing works.")'),true);
 await evaluate('document.querySelector(".ql-image").click()');await until('Boolean(document.querySelector("dialog[open]"))');
 await file('#article-image-file');await fill('#article-image-alt','Inline laboratory image');await fill('#article-image-caption','Uploaded inside the rich text editor.');await clickText('Upload & insert image');
 await until('!document.querySelector("dialog[open]") && Boolean(document.querySelector(".ql-editor img"))');
 const embedded=await evaluate('({src:document.querySelector(".ql-editor img").getAttribute("src"),alt:document.querySelector(".ql-editor img").alt})');uploaded.push(embedded.src);assert.equal(embedded.alt,'Inline laboratory image');
 await file('#featured-image-file');await until('document.querySelector("#image_url").value.startsWith("/media/")');uploaded.push(await evaluate('document.querySelector("#image_url").value'));
 await fill('#image_alt','Featured laboratory instrument');await fill('#meta_title','Testing SEO title');await fill('#meta_description','Search description created in the SEO form.');await fill('#focus_keyword','testing');await fill('#meta_keywords','testing, laboratory');
 await evaluate('document.querySelector("details").open=true');await fill('#og_title','Custom social title');await fill('#og_description','Custom social description');
 await clickText('Save draft');await until('location.pathname.startsWith("/admin/blogs/")');postId=await evaluate('location.pathname.split("/").pop()');await until('Boolean(document.querySelector(".ql-editor img"))');
 assert.equal(await evaluate('document.querySelector("#author_id").value'),authorId);
 assert.equal(await evaluate('document.querySelector(".ql-editor img").alt'),'Inline laboratory image');
 const defaultAuthor=(await api('/api/admin/authors')).authors.find(author=>author.active && author.id!==authorId);
 await fill('#author_id',defaultAuthor.id);await fill('#meta_title','Updated rich text SEO title');await evaluate('document.querySelector("form").requestSubmit()');await until('document.body.innerText.includes("Article published.")');
 const saved=(await api('/api/admin/posts/'+postId)).post;assert.equal(saved.author_id,defaultAuthor.id);assert.match(saved.content,/<strong>bold<\/strong>/);assert.match(saved.content,/alt="Inline laboratory image"/);assert.equal(saved.og_title,'Custom social title');
 fs.mkdirSync('review',{recursive:true});await evaluate('window.scrollTo(0,0)');await wait(300);const admin=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('review/rich-editor.png',Buffer.from(admin.data,'base64'));
 await navigate('/blog/'+slug);await until('document.querySelector("h1")?.textContent === "Testing rich text workflow"');
 assert.equal(await evaluate('document.title'),'Updated rich text SEO title');assert.equal(await evaluate('Array.from(document.querySelectorAll("meta")).find(meta=>meta.getAttribute("property")==="og:title").content'),'Custom social title');
 assert.equal(await evaluate('Array.from(document.images).filter(image=>image.alt==="Inline laboratory image").length'),1);
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await wait(300);assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
 await navigate('/admin/blogs/'+postId);await until('Boolean(document.querySelector(".ql-editor img"))');assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
 await evaluate('document.querySelector(".ql-image").click()');await until('Boolean(document.querySelector("dialog[open]"))');assert.equal(await evaluate('document.querySelector("dialog").getBoundingClientRect().width <= innerWidth'),true);await evaluate('document.querySelector("dialog").close()');
 await api('/api/admin/posts/'+postId,{method:'DELETE'});postId='';await api('/api/admin/authors/'+authorId,{method:'DELETE'});authorId='';
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await navigate('/admin/authors');await until('document.body.innerText.includes("PAKMOO")');
 console.log('PASS: author creation/edit/photo, visual editor typing, HTML mode, inline image upload/alt/caption, add/edit author assignment, SEO/social fields, draft/publish, public rendering, mobile layout. Test records removed.');
}finally {
 if(postId)await api('/api/admin/posts/'+postId,{method:'DELETE'}).catch(()=>{});
 if(authorId)await api('/api/admin/authors/'+authorId,{method:'DELETE'}).catch(()=>{});
 for(const url of uploaded)if(/^\/media\/[a-f0-9-]{36}\.jpg$/.test(url))fs.rmSync('.data/uploads/'+url.split('/').pop(),{force:true});
 socket.close();
}
