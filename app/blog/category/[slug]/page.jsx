import {notFound} from 'next/navigation';
import BlogListing from '@/components/blog/BlogListing';
import {ensureCmsSeed} from '@/server/bootstrap';
import {publicContentBySlug} from '@/server/cms';
import {listPosts} from '@/server/posts';
export const dynamic='force-dynamic';
export default async function Page({params}){ensureCmsSeed();const row=publicContentBySlug('blogcategory',decodeURIComponent((await params).slug));if(!row)notFound();return <BlogListing initialCategory={row.key} blogsData={listPosts().map(post=>({...post,id:post.slug}))}/>;}
