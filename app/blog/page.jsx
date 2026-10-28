import BlogListing from '@/components/blog/BlogListing';
import { listPosts, siteUrl } from '@/server/posts';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export function generateMetadata(){return {title:'Blog & Insights | PAKMOO Testing Instruments',description:'Testing standards guides, quality control insights, and product updates from PAKMOO.',alternates:{canonical:siteUrl()+'/blog'},openGraph:{title:'Blog & Insights | PAKMOO',description:'Testing standards guides, quality control insights, and product updates.',url:siteUrl()+'/blog',type:'website'}};}
export default function BlogPage(){return <BlogListing blogsData={listPosts().map(post=>({...post,id:post.slug}))} />;}
