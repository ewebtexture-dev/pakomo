import { siteUrl } from './posts.js';
export function articleMetadata(post) {
  const title=post.meta_title || post.title;
  const description=post.meta_description || post.excerpt;
  const url=post.canonical_url || siteUrl()+'/blog/'+post.slug;
  const socialImage=post.og_image || post.image_url;
  const image=socialImage?new URL(socialImage,siteUrl()).href:null;
  const socialTitle=post.og_title || title, socialDescription=post.og_description || description;
  const extra=post.extra_seo||{};const twitterImage=extra.twitterImage?new URL(extra.twitterImage,siteUrl()).href:image;
  return {title,description,keywords:post.meta_keywords?post.meta_keywords.split(',').map(tag=>tag.trim()).filter(Boolean):undefined,
    authors:[{name:post.author,...(post.authorProfile?.website_url?{url:post.authorProfile.website_url}:{})}],alternates:{canonical:url},
    robots:{index:!post.noindex,follow:!post.nofollow},
    openGraph:{type:'article',title:socialTitle,description:socialDescription,url,siteName:'PAKMOO Testing Instruments',publishedTime:post.published_at,modifiedTime:post.updated_at,authors:[post.authorProfile?.website_url || post.author],...(image?{images:[{url:image,alt:post.image_alt}]}:{})},
    twitter:{card:extra.twitterCard||'summary_large_image',title:extra.twitterTitle||socialTitle,description:extra.twitterDescription||socialDescription,...(twitterImage?{images:[twitterImage]}:{})}};
}
export function articleSchema(post) {
  const url=post.canonical_url || siteUrl()+'/blog/'+post.slug;
  const result={'@context':'https://schema.org','@graph':[
    {'@type':'BlogPosting','@id':url+'#article',headline:post.title,description:post.meta_description || post.excerpt,
      datePublished:post.published_at,dateModified:post.updated_at,
      articleSection:post.categoryProfiles?.map(c=>c.name).join(', ')||post.category.replaceAll('_',' '), keywords:post.meta_keywords || post.focus_keyword || undefined,
      author:{'@type':'Person',name:post.author,
        ...(post.authorProfile?.bio?{description:post.authorProfile.bio}:{}),
        ...(post.authorProfile?.job_title?{jobTitle:post.authorProfile.job_title}:{}),
        ...(post.authorProfile?.website_url?{url:post.authorProfile.website_url}:{}),
        ...(post.authorProfile?.avatar_url?{image:new URL(post.authorProfile.avatar_url,siteUrl()).href}:{})},
      publisher:{'@type':'Organization',name:'PAKMOO Testing Instruments',url:siteUrl()},
      mainEntityOfPage:{'@type':'WebPage','@id':url},...(post.image_url?{image:new URL(post.image_url,siteUrl()).href}:{})},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:siteUrl()},
      {'@type':'ListItem',position:2,name:'Blog',item:siteUrl()+'/blog'},
      {'@type':'ListItem',position:3,name:post.title,item:url}]}
  ]};
  if(post.schema?.customJson){const custom=JSON.parse(post.schema.customJson);result['@graph'].push(...(Array.isArray(custom)?custom:custom['@graph']||[custom]));}
  if(post.schema?.type&&post.schema.type!=='WebPage'&&post.schema.type!=='FAQPage')result['@graph'][0]['@type']=post.schema.type;
  result['@graph']=result['@graph'].filter(item=>item['@type']!=='FAQPage');return result;
}
