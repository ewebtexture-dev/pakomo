import { NextResponse } from 'next/server';
import { currentAdmin } from './auth.js';

export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export function assertSameOrigin(request) {
  const origin = request.headers.get('origin');
  const expected = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : new URL(request.url).origin;
  if (!origin || origin !== expected) throw new HttpError(403, 'This request must come from this website.');
}
export async function requireAdmin(request) {
  const admin = await currentAdmin();
  if (!admin) throw new HttpError(401, 'Please sign in to continue.');
  if (!['GET','HEAD'].includes(request.method)) assertSameOrigin(request);
  return admin;
}
export async function readJson(request, maxBytes = 250000) {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new HttpError(415, 'Send JSON content.');
  const body = await readBody(request, maxBytes);
  try { return JSON.parse(body.toString('utf8')); } catch { throw new HttpError(400, 'Invalid JSON.'); }
}
export async function readBody(request, maxBytes) {
  if (Number(request.headers.get('content-length')) > maxBytes) throw new HttpError(413, 'Request is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Request body is required.');
  let size = 0; const chunks = [];
  while (true) { const {done,value} = await reader.read(); if(done) break; size += value.byteLength;
    if(size > maxBytes) { await reader.cancel(); throw new HttpError(413, 'Request is too large.'); } chunks.push(Buffer.from(value)); }
  return Buffer.concat(chunks);
}
export function apiError(error) {
  if (error instanceof HttpError) return NextResponse.json({error:error.message},{status:error.status});
  console.error('Backend request failed:', error.message);
  return NextResponse.json({error:'The request could not be completed. Please try again.'},{status:500});
}
