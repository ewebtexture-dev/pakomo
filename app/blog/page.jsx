import BlogListing from '@/components/blog/BlogListing';
import {cmsMetadata} from '@/server/cms-seo';
import { listPosts, siteUrl } from '@/server/posts';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export function generateMetadata(){return cmsMetadata('/blog');}
export default function BlogPage(){return <BlogListing blogsData={listPosts().map(post=>({...post,id:post.slug}))} />;}
