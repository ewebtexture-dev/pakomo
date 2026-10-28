import { NextResponse } from 'next/server';
import { findPost, savePost, deletePost } from '@/server/posts';
import { requireAdmin, readJson, apiError, HttpError } from '@/server/http';
export const runtime='nodejs';
export async function GET(request,{params}){try{await requireAdmin(request);const post=findPost((await params).id);if(!post)throw new HttpError(404,'Article not found.');return NextResponse.json({post},{headers:{'Cache-Control':'no-store'}});}catch(error){return apiError(error);}}
export async function PUT(request,{params}){try{await requireAdmin(request);return NextResponse.json({post:savePost(await readJson(request),(await params).id)});}catch(error){return apiError(error);}}
export async function DELETE(request,{params}){try{await requireAdmin(request);deletePost((await params).id);return NextResponse.json({ok:true});}catch(error){return apiError(error);}}
