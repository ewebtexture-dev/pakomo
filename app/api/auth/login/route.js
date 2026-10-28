import { NextResponse } from 'next/server';
import { assertSameOrigin, readJson, apiError } from '@/server/http';
import { login, sessionCookie } from '@/server/auth';
export const runtime = 'nodejs';
export async function POST(request) {
  try {
    assertSameOrigin(request);
    const body=await readJson(request,4096);
    if(typeof body.username!=='string'||typeof body.password!=='string'||body.password.length>256) return NextResponse.json({error:'Invalid username or password.'},{status:401});
    const result=login(body.username,body.password);
    if(result.error)return NextResponse.json({error:result.error},{status:result.status});
    const response=NextResponse.json({admin:result.admin});
    response.cookies.set(sessionCookie(result.token,request));
    response.headers.set('Cache-Control','no-store');
    return response;
  } catch(error){return apiError(error);}
}
