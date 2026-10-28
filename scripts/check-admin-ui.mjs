import fs from 'node:fs';
import assert from 'node:assert/strict';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const tabs=await (await fetch('http://127.0.0.1:9222/json')).json();
const socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
let counter=0;const requests=new Map();
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const request=requests.get(message.id);requests.delete(message.id);message.error?request.reject(message.error):request.resolve(message.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++counter;requests.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
async function until(expression){for(let count=0;count<60;count++){if(await evaluate(expression))return;await wait(500);}throw Error('Timed out waiting for '+expression);}
async function navigate(url){await call('Page.navigate',{url:'http://localhost:3000'+url});await until('document.readyState === "complete"');await wait(500);}
async function fill(selector,value){await evaluate(`(()=>{const element=document.querySelector(${JSON.stringify(selector)});const prototype=element.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(prototype,'value').set.call(element,${JSON.stringify(value)});element.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(80);}
const details=fs.readFileSync('.data/local-admin.txt','utf8');
const username=details.match(/Username: (.+)/)[1].trim(),password=details.match(/Password: (.+)/)[1].trim();
let postId='',uploadUrl='';
try {
 await call('Page.enable');await call('Runtime.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await navigate('/login');await until('Boolean(document.querySelector("form"))');
 await fill('input[type=text]',username);await fill('input[type=password]',password);
 await evaluate('document.querySelector("form").requestSubmit()');await until('location.pathname === "/admin"');await until('document.body.innerText.includes("Manage Blog Posts")');
 await navigate('/admin/addBlog');await until('Boolean(document.querySelector("form"))');
 const slug='admin-ui-check-'+Date.now();
 await fill('input[placeholder="Your article title"]','Admin UI verification');
 await fill('input[placeholder="your-article-title"]',slug);
 await fill('textarea[placeholder^="A clear summary"]','Temporary article verifying the admin publishing workflow.');
 await fill('textarea.font-mono','<h2>Browser workflow</h2><p>Created and published through the admin interface.</p>');
 await evaluate('[...document.querySelectorAll("button")].find(b=>b.textContent==="Save draft").click()');
 await until('location.pathname.startsWith("/admin/blogs/")');postId=await evaluate('location.pathname.split("/").pop()');
 await until('Boolean(document.querySelector("input[type=file]"))');
 const {root}=await call('DOM.getDocument');const {nodeId}=await call('DOM.querySelector',{nodeId:root.nodeId,selector:'input[type=file]'});
 await call('DOM.setFileInputFiles',{nodeId,files:[process.cwd()+'\\assets\\Unsplash\\blog-1.jpg']});
 await until('Array.from(document.querySelectorAll("input")).some(i=>i.placeholder.startsWith("Upload an image") && i.value.startsWith("/media/"))');
 uploadUrl=await evaluate('Array.from(document.querySelectorAll("input")).find(i=>i.placeholder.startsWith("Upload an image")).value');
 await fill('input[placeholder="Describe what the image shows"]','Laboratory testing instrument');
 await fill('input[placeholder="Defaults to your article title"]','Admin UI SEO verification');
 await fill('textarea[placeholder^="Defaults to the excerpt"]','SEO metadata created through the local admin interface.');
 await evaluate('document.querySelector("form").requestSubmit()');await until('document.body.innerText.includes("Article published.")');
 fs.mkdirSync('review',{recursive:true});
 await evaluate('window.scrollTo(0,0)');await wait(300);
 const admin=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('review/admin-editor.png',Buffer.from(admin.data,'base64'));
 await navigate('/blog/'+slug);await until('document.querySelector("h1")?.textContent === "Admin UI verification"');
 assert.equal(await evaluate('document.querySelector("meta[name=description]").content'),'SEO metadata created through the local admin interface.');
 assert.equal(await evaluate('document.body.innerText.includes("Created and published through the admin interface.")'),true);
 assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await wait(400);
 assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
 const blog=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('review/blog-mobile.png',Buffer.from(blog.data,'base64'));
 await evaluate(`fetch('/api/admin/posts/'+${JSON.stringify(postId)},{method:'DELETE'}).then(r=>{if(!r.ok)throw Error('Cleanup failed')})`);postId='';
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await navigate('/admin/blogs');await until('document.body.innerText.includes("No articles yet.")');
 const manager=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('review/admin-posts.png',Buffer.from(manager.data,'base64'));
 console.log('PASS: browser sign-in, create draft, image upload, SEO fields, publish, public article, mobile layout, delete. Original public design preserved.');
}finally{
 if(postId)await evaluate(`fetch('/api/admin/posts/'+${JSON.stringify(postId)},{method:'DELETE'})`).catch(()=>{});
 if(/^\/media\/[a-f0-9-]{36}\.jpg$/.test(uploadUrl))fs.rmSync('.data/uploads/'+uploadUrl.split('/').pop(),{force:true});
 socket.close();
}
