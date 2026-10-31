import {revalidatePath} from 'next/cache';
import { NextResponse } from 'next/server';
import { findPost, savePost, deletePost, unpublishPost } from '@/server/posts';
import { requireAdmin, readJson, apiError, HttpError } from '@/server/http';
import {database} from '@/server/database';
export const runtime='nodejs';
export async function GET(request,{params}){try{await requireAdmin(request);const post=findPost((await params).id);if(!post)throw new HttpError(404,'Article not found.');return NextResponse.json({post,revisions:database().prepare("SELECT id,actor_id,created_at FROM content_revisions WHERE entity_type='post' AND entity_id=? ORDER BY id DESC LIMIT 10").all(post.id)},{headers:{'Cache-Control':'no-store'}});}catch(error){return apiError(error);}}
export async function PUT(request,{params}){try{const actor=await requireAdmin(request),{id}=await params;let body=await readJson(request);if(body.action==='unpublish'){unpublishPost(id,actor);revalidatePath('/','layout');return NextResponse.json({post:findPost(id)});}if(body.action==='restore'){const row=database().prepare("SELECT snapshot_json FROM content_revisions WHERE id=? AND entity_type='post' AND entity_id=?").get(body.revisionId,id);if(!row)throw new HttpError(404,'Revision not found.');body={...JSON.parse(row.snapshot_json),status:'draft'};}const post=savePost(body,id,actor);revalidatePath('/','layout');return NextResponse.json({post});}catch(error){return apiError(error);}}
export async function DELETE(request,{params}){try{await requireAdmin(request);deletePost((await params).id);revalidatePath('/','layout');return NextResponse.json({ok:true});}catch(error){return apiError(error);}}
