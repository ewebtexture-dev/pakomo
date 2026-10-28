import { listPosts, siteUrl } from '@/server/posts';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export default function sitemap(){const base=siteUrl();return [
  ...['','/about','/products','/services','/applications','/clients','/testing-standards','/why-choose-us','/contact','/blog'].map(route=>({url:base+route})),
  ...listPosts().filter(post=>!post.noindex && (!post.canonical_url || post.canonical_url===base+'/blog/'+post.slug)).map(post=>({url:base+'/blog/'+post.slug,lastModified:post.updated_at}))
];}
