import { NextResponse } from 'next/server';
import { listPosts } from '@/server/posts';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){return NextResponse.json({posts:listPosts().map(post=>({...post,id:post.slug}))},{headers:{'Cache-Control':'no-store'}});}
