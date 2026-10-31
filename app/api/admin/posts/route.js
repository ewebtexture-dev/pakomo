import {revalidatePath} from 'next/cache';
import { NextResponse } from 'next/server';
import { listPosts, savePost } from '@/server/posts';
import { requireAdmin, readJson, apiError } from '@/server/http';
export const runtime='nodejs';
export async function GET(request){try{await requireAdmin(request);return NextResponse.json({posts:listPosts(true)},{headers:{'Cache-Control':'no-store'}});}catch(error){return apiError(error);}}
export async function POST(request){try{const actor=await requireAdmin(request);const post=savePost(await readJson(request),null,actor);revalidatePath('/','layout');return NextResponse.json({post},{status:201});}catch(error){return apiError(error);}}
