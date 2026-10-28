import { NextResponse } from 'next/server';
import { listAuthors, saveAuthor } from '@/server/authors';
import { requireAdmin, readJson, apiError } from '@/server/http';
export const runtime='nodejs';
export async function GET(request){try{await requireAdmin(request);return NextResponse.json({authors:listAuthors()},{headers:{'Cache-Control':'no-store'}});}catch(error){return apiError(error);}}
export async function POST(request){try{await requireAdmin(request);return NextResponse.json({author:saveAuthor(await readJson(request,20000))},{status:201});}catch(error){return apiError(error);}}
