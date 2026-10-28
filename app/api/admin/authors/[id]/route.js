import { NextResponse } from 'next/server';
import { findAuthor, saveAuthor, deleteAuthor } from '@/server/authors';
import { requireAdmin, readJson, apiError, HttpError } from '@/server/http';
export const runtime='nodejs';
export async function GET(request,{params}){try{await requireAdmin(request);const author=findAuthor((await params).id);if(!author)throw new HttpError(404,'Author not found.');return NextResponse.json({author},{headers:{'Cache-Control':'no-store'}});}catch(error){return apiError(error);}}
export async function PUT(request,{params}){try{await requireAdmin(request);return NextResponse.json({author:saveAuthor(await readJson(request,20000),(await params).id)});}catch(error){return apiError(error);}}
export async function DELETE(request,{params}){try{await requireAdmin(request);deleteAuthor((await params).id);return NextResponse.json({ok:true});}catch(error){return apiError(error);}}
