import assert from 'node:assert/strict';
import fs from 'node:fs';
import {htmlToDOM} from 'html-react-parser';
import {blogListingDefaults,paginationItems,listingDate} from '../src/cms/blog-features.js';
import {importFaqText} from '../src/cms/blog-faq.js';
import {analyzeSeo} from '../src/cms/seo-score.js';
const base=process.env.TEST_ORIGIN||'http://localhost:3000';if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Regression fixtures are local only.');
const creds=fs.readFileSync('.data/local-admin.txt','utf8');let cookie='';const ids=[];let pageBefore,reviewersBefore,categoryId;const statePath='.data/blog-grid-test-state.json';
async function req(path,method='GET',body){return fetch(base+path,{method,headers:{cookie,Origin:base,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});}
async function json(path,method='GET',body,status=200){const r=await req(path,method,body),d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d;}
const nodes=(html,name,predicate=()=>true)=>{const found=[];const walk=list=>list.forEach(n=>{if(n.name===name&&predicate(n))found.push(n);if(n.children)walk(n.children);});walk(htmlToDOM(html));return found;};
const text=n=>n.type==='text'?n.data:(n.children||[]).map(text).join('');
const schemas=html=>nodes(html,'script',n=>n.attribs.type==='application/ld+json').flatMap(n=>{const p=JSON.parse(text(n));return p['@graph']||[p];});
const hasType=(n,type)=>[].concat(n['@type']||[]).includes(type);
async function html(path){const r=await req(path);assert.equal(r.status,200,path);return r.text();}
async function login(){const r=await req('/api/auth/login','POST',{username:creds.match(/Username: (.+)/)[1].trim(),password:creds.match(/Password: (.+)/)[1].trim()});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];}
async function cleanup(state){for(const id of state.ids||[])await req('/api/admin/posts/'+id,'DELETE');if(state.categoryId)await req('/api/admin/content/'+state.categoryId,'DELETE');if(state.pageBefore){const current=(await json('/api/admin/content/'+state.pageBefore.id)).record;await json('/api/admin/content/'+current.id,'PUT',{...state.pageBefore,version:current.version});}if(state.reviewersBefore)await json('/api/admin/settings','PUT',{scope:'reviewers',settings:{items:state.reviewersBefore.items||[]}});}
await login();if(process.argv[2]==='cleanup'){await cleanup(JSON.parse(fs.readFileSync(statePath,'utf8')));console.log('Regression fixtures removed and settings restored.');process.exit(0);}
try{
 assert.ok(paginationItems(8,20).includes('ellipsis-6'));assert.equal(listingDate('2026-10-31T00:00:00Z'),'31 Oct, 2026');
 const imported=importFaqText('Q: Safe question?\nA: Text <script>alert(1)</script>\nQ2: Second?\nA: More text.');assert.equal(imported.length,2);assert.ok(!imported[0].a.includes('<script>'));
 const faq={heading:'Frequently Asked Questions',description:'',items:[{id:'faq-test',q:'How is quality measured?',a:'<p>Quality '+('testing '.repeat(610))+'</p>',enabled:true}]};
 const score=analyzeSeo({contentHtml:'<p>Article body.</p>',isBlog:true,focusKeyword:'quality',faqSection:faq});assert.ok(score.wordCount>610);assert.equal(score.checks.find(c=>c.id==='faq-schema').status,'good');assert.equal(analyzeSeo({isBlog:true}).checks.find(c=>c.id==='faq-schema').status,'improve');
 const token='blog-grid-'+Date.now();pageBefore=(await json('/api/admin/content?kind=page')).records.find(p=>p.key==='blog');reviewersBefore=(await json('/api/admin/settings?scope=reviewers')).settings;
 const settings={...blogListingDefaults,postsPerPage:12};let current=(await json('/api/admin/content/'+pageBefore.id,'PUT',{...pageBefore,status:'published',payload:{...pageBefore.payload,blogListing:settings}})).record;
 await json('/api/admin/content/'+current.id,'PUT',{...current,payload:{...current.payload,blogListing:{...settings,postsPerPage:0}}},422);
 const reviewer={id:crypto.randomUUID(),name:'Regression Reviewer',role:'Technical Expert',profileUrl:'https://www.linkedin.com/in/example-reviewer/'};
 await json('/api/admin/settings','PUT',{scope:'reviewers',settings:{items:[...(reviewersBefore.items||[]),reviewer]}});assert.ok((await json('/api/admin/reviewers')).reviewers.some(r=>r.id===reviewer.id));
 await json('/api/admin/settings','PUT',{scope:'reviewers',settings:{items:[{...reviewer,profileUrl:'javascript:alert(1)'}]}},422);
 const category=(await json('/api/admin/content','POST',{kind:'blogcategory',key:token,slug:token,title:'Grid regression category',enabled:true,status:'published',payload:{name:'Grid regression category',description:''}},201)).record;categoryId=category.id;
 const author=(await json('/api/admin/authors')).authors.find(a=>a.active);
 const make=(i,patch={})=>({title:'Grid regression '+token+' '+i,slug:token+'-'+i,excerpt:'Legacy excerpt preserved.',short_summary:i===1?'':'<b>Plain quality testing summary.</b>',meta_description:i===1?'Metadata fallback summary.':'Quality testing article metadata.',content:'<h2>Testing guide</h2><p>Article body for regression checks.</p>',category:category.key,category_ids:[category.key],author_id:author.id,image_url:'/image-placeholder.svg',image_alt:'Testing instrument',status:'published',published_at:new Date(Date.now()-i*60000-10000).toISOString(),reviewer:i===0?reviewer:null,faqSection:{heading:'Frequently Asked Questions',description:'',items:[]},...patch});
 for(let i=0;i<13;i++){const p=(await json('/api/admin/posts','POST',make(i,i===1?{faqSection:{items:[]}}:{}),201)).post;ids.push(p.id);assert.ok(!p.short_summary.includes('<'));assert.equal(p.faqSection.heading,'Frequently Asked Questions');}
 const scheduled=(await json('/api/admin/posts','POST',make(20,{title:'Hidden scheduled regression',published_at:new Date(Date.now()+86400000).toISOString()}),201)).post;ids.push(scheduled.id);
 const draft=(await json('/api/admin/posts','POST',make(21,{title:'Hidden draft regression',status:'draft'}),201)).post;ids.push(draft.id);
 await json('/api/admin/posts','POST',make(22,{short_summary:'a'.repeat(201)}),422);await json('/api/admin/posts','POST',make(23,{reviewer:{name:'Invalid URL',profileUrl:'data:text/html,unsafe'}}),422);
 const path='/blog/category/'+category.slug,first=await html(path),second=await html(path+'?page=2');
 assert.equal(nodes(first,'article',n=>'data-blog-card'in n.attribs).length,12);assert.equal(nodes(second,'article',n=>'data-blog-card'in n.attribs).length,1);
 assert.ok(!first.includes('Hidden scheduled regression'));assert.ok(!first.includes('Hidden draft regression'));assert.ok(first.includes('Metadata fallback summary.'));
 assert.ok(nodes(first,'a',n=>n.attribs.rel==='next'&&n.attribs.href===path+'?page=2').length);assert.ok(nodes(second,'a',n=>n.attribs.rel==='prev'&&n.attribs.href===path).length);
 assert.equal(nodes(second,'link',n=>n.attribs.rel==='canonical')[0].attribs.href,base+path+'?page=2');assert.ok(schemas(first).some(n=>hasType(n,'CollectionPage')));assert.equal(schemas(first).find(n=>hasType(n,'ItemList')).itemListElement.length,12);
 current=(await json('/api/admin/content/'+current.id,'PUT',{...current,payload:{...current.payload,seo:{...current.payload.seo,canonicalUrl:base+'/custom-blog-canonical'}}})).record;assert.equal(nodes(await html('/blog'),'link',n=>n.attribs.rel==='canonical')[0].attribs.href,base+'/custom-blog-canonical');current=(await json('/api/admin/content/'+current.id,'PUT',{...current,payload:{...current.payload,seo:pageBefore.payload.seo||{}}})).record;
 assert.equal((await req('/blog/'+scheduled.slug)).status,404);assert.equal((await req(path+'?page=3')).status,404);
 let post=(await json('/api/admin/posts/'+ids[0])).post;const article='/blog/'+post.slug;let body=await html(article);assert.equal(schemas(body).filter(n=>hasType(n,'FAQPage')).length,0);assert.equal(nodes(body,'section',n=>n.attribs.id==='post-faqs').length,0);assert.equal(schemas(body).find(n=>hasType(n,'BlogPosting')).reviewedBy.name,reviewer.name);
 post=(await json('/api/admin/posts/'+post.id,'PUT',{...post,status:'draft',faqSection:faq})).post;assert.equal(schemas(await html(article)).filter(n=>hasType(n,'FAQPage')).length,0,'Draft FAQs must stay private');
 post=(await json('/api/admin/posts/'+post.id,'PUT',{...post,status:'published',schema:{customJson:JSON.stringify({'@graph':[{'@type':'FAQPage',mainEntity:[]},{'@type':['WebPage','FAQPage'],mainEntity:[]}]})}})).post;body=await html(article);const faqNodes=schemas(body).filter(n=>hasType(n,'FAQPage'));assert.equal(faqNodes.length,1);assert.equal(faqNodes[0].mainEntity.length,1);assert.ok(!faqNodes[0].mainEntity[0].acceptedAnswer.text.includes('<p>'));assert.equal(nodes(body,'section',n=>n.attribs.id==='post-faqs').length,1);assert.ok(body.indexOf('id="post-faqs"')<body.indexOf('<aside'));
 post=(await json('/api/admin/posts/'+post.id,'PUT',{...post,faqSection:{...faq,items:faq.items.map(i=>({...i,enabled:false}))}})).post;assert.equal(schemas(await html(article)).filter(n=>hasType(n,'FAQPage')).length,0);
 post=(await json('/api/admin/posts/'+post.id,'PUT',{...post,faqSection:{...faq,items:[]}})).post;assert.equal(nodes(await html(article),'section',n=>n.attribs.id==='post-faqs').length,0);
 // Leave one active FAQ for browser copy/reorder/accordion tests.
 await json('/api/admin/posts/'+post.id,'PUT',{...post,faqSection:{...faq,items:[{id:'browser-faq',q:'Browser quality question?',a:'<p>A <strong>sanitized</strong> answer.</p>',enabled:true}]}});
 fs.writeFileSync(statePath,JSON.stringify({ids,categoryId,pageBefore,reviewersBefore,categorySlug:category.slug,reviewer,firstPostId:post.id,firstPostSlug:post.slug,secondPostId:ids[1]}));
 console.log(JSON.stringify({result:'PASS',serverRenderedCards:12,secondPageCards:1,canonical:true,relPrevNext:true,collectionSchema:true,reviewerSchema:true,summaryFallback:true,optionalValidation:true,scheduledHidden:true,draftPrivate:true,faqZeroAddDisableDelete:true,faqSchemaOnce:true,faqPosition:true,faqSeoScore:true,qaImport:true}));
}finally{if(process.env.KEEP_BLOG_FIXTURES==='1'){const previous=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):{};fs.writeFileSync(statePath,JSON.stringify({...previous,ids,categoryId,pageBefore,reviewersBefore}));}else await cleanup({ids,categoryId,pageBefore,reviewersBefore});await req('/api/auth/logout','POST');}
