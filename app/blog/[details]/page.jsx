import { notFound, permanentRedirect } from 'next/navigation';
import BlogArticle from '@/components/blog/BlogArticle';
import {publishedPost,redirectForSlug,listPosts} from '@/server/posts';
import { articleMetadata, articleSchema } from '@/server/seo';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function generateMetadata({params}){
  const post=publishedPost((await params).details);
  return post?articleMetadata(post):{title:'Article not found | PAKMOO',robots:{index:false,follow:false}};
}
export default async function BlogDetail({params}) {
  const {details}=await params;
  const post=publishedPost(details);
  if(!post){const next=redirectForSlug(details);if(next)permanentRedirect('/blog/'+next);notFound();}
  const schema=articleSchema(post);
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}} /><BlogArticle post={{...post,id:post.slug}} blogPosts={listPosts().map(p=>({...p,id:p.slug}))} /></>;
}
