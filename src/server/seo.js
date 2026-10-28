import { siteUrl } from './posts.js';
export function articleMetadata(post) {
  const title=post.meta_title || post.title;
  const description=post.meta_description || post.excerpt;
  const url=post.canonical_url || siteUrl()+'/blog/'+post.slug;
  const image=post.image_url?new URL(post.image_url,siteUrl()).href:null;
  return {title,description,authors:[{name:post.author}],alternates:{canonical:url},
    robots:{index:!post.noindex,follow:true},
    openGraph:{type:'article',title,description,url,siteName:'PAKMOO Testing Instruments',publishedTime:post.published_at,modifiedTime:post.updated_at,authors:[post.author],...(image?{images:[{url:image,alt:post.image_alt}]}:{})},
    twitter:{card:'summary_large_image',title,description,...(image?{images:[image]}:{})}};
}
export function articleSchema(post) {
  const url=post.canonical_url || siteUrl()+'/blog/'+post.slug;
  return {'@context':'https://schema.org','@graph':[
    {'@type':'BlogPosting','@id':url+'#article',headline:post.title,description:post.meta_description || post.excerpt,
      datePublished:post.published_at,dateModified:post.updated_at,author:{'@type':'Person',name:post.author},
      publisher:{'@type':'Organization',name:'PAKMOO Testing Instruments',url:siteUrl()},
      mainEntityOfPage:{'@type':'WebPage','@id':url},...(post.image_url?{image:new URL(post.image_url,siteUrl()).href}:{})},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:siteUrl()},
      {'@type':'ListItem',position:2,name:'Blog',item:siteUrl()+'/blog'},
      {'@type':'ListItem',position:3,name:post.title,item:url}]}
  ]};
}
