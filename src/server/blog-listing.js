import {notFound} from 'next/navigation';
import {ensureCmsSeed} from './bootstrap.js';
import {listContent} from './cms.js';
import {listPosts,siteUrl} from './posts.js';
import {cmsMetadata} from './cms-seo.js';
import {blogListingSettings,pageNumber} from '../cms/blog-features.js';
import {plainText} from '../cms/plain-text.js';

export function blogListingData({page=1,category=null,path='/blog'}={}){
  ensureCmsSeed();
  const row=listContent('page',true).find(r=>r.key==='blog'),settings=blogListingSettings(row?.payload);
  const all=listPosts().filter(p=>p.status==='published'&&(!category||(p.category_ids||[p.category]).includes(category.key)));
  const totalPages=Math.max(1,Math.ceil(all.length/settings.postsPerPage));
  page=pageNumber(page);if(page>totalPages)notFound();
  return {settings,path,page,totalPages,total:all.length,posts:all.slice((page-1)*settings.postsPerPage,page*settings.postsPerPage),categories:listContent('blogcategory',true).map(c=>({key:c.key,name:c.payload.name,slug:c.slug})),category:category?{key:category.key,name:category.payload.name}:null,bannerImage:row?.payload.sections?.listing?.image_4};
}
export function listingMetadata(path,page){
  const meta=cmsMetadata(path),canonical=page>1?siteUrl()+path+'?page='+page:(meta.alternates?.canonical||siteUrl()+path);
  return {...meta,...(page>1?{title:`${typeof meta.title==='string'?meta.title:'Blogs'} – Page ${page}`} :{}),alternates:{...meta.alternates,canonical},openGraph:{...meta.openGraph,url:canonical}};
}
export function listingSchema(model){
  const url=siteUrl()+model.path+(model.page>1?'?page='+model.page:''),listId=url+'#posts';
  return {'@context':'https://schema.org','@graph':[
    {'@type':'CollectionPage','@id':url+'#collection',url,name:plainText(model.settings.bannerHeading),description:plainText(model.settings.introDescription),mainEntity:{'@id':listId},isPartOf:{'@id':siteUrl()+'/blog#blog'}},
    {'@type':'Blog','@id':siteUrl()+'/blog#blog',name:'PAKMOO Blogs',url:siteUrl()+'/blog',blogPost:model.posts.map(p=>({'@type':'BlogPosting',headline:plainText(p.title),url:siteUrl()+'/blog/'+p.slug,datePublished:p.published_at}))},
    {'@type':'ItemList','@id':listId,numberOfItems:model.posts.length,itemListElement:model.posts.map((p,i)=>({'@type':'ListItem',position:(model.page-1)*model.settings.postsPerPage+i+1,url:siteUrl()+'/blog/'+p.slug,name:plainText(p.title)}))},
  ]};
}
