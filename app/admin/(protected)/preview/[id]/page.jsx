import { notFound } from 'next/navigation';
import Link from 'next/link';
import { currentAdmin } from '@/server/auth';
import { findPost } from '@/server/posts';
import BlogArticle from '@/components/blog/BlogArticle';
export default async function Preview({params}) {
  if(!await currentAdmin())notFound();
  const post=findPost((await params).id);
  if(!post)notFound();
  return <><div className="bg-amber-50 text-amber-900 px-5 py-4 text-sm text-center border-b border-amber-200">Private preview of saved content · {post.status} · <Link className="underline" href={'/admin/blogs/'+post.id}>Return to editor</Link></div><BlogArticle post={{...post,id:post.slug}} blogPosts={[]} /></>;
}
