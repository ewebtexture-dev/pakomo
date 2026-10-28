import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, hashToken, sessionCookie } from '@/server/auth';
import { database } from '@/server/database';
import { assertSameOrigin, apiError } from '@/server/http';
export async function POST(request) {
  try {
    assertSameOrigin(request);
    const token=(await cookies()).get(SESSION_COOKIE)?.value;
    if(token)database().prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(token));
    const response=NextResponse.json({ok:true});response.cookies.set(sessionCookie('',request,0));return response;
  }catch(error){return apiError(error);}
}
