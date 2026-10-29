import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {requireAdmin,readJson,apiError} from '@/server/http';
import {listContent,saveContent} from '@/server/cms';
import {ensureCmsSeed} from '@/server/bootstrap';
export const runtime='nodejs';
export async function GET(request){try{ensureCmsSeed();await requireAdmin(request);return NextResponse.json({records:listContent(new URL(request.url).searchParams.get('kind')||'page')},{headers:{'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
export async function POST(request){try{const actor=await requireAdmin(request);const item=saveContent(await readJson(request,1500000),null,actor);revalidatePath('/','layout');return NextResponse.json({record:item},{status:201});}catch(e){return apiError(e);}}
