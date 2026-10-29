import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {dataDirectory} from '@/server/data-directory';
export const runtime='nodejs';
export async function GET(request,{params}) {
  const {filename}=await params;
  if(!/^[a-f0-9-]{36}\.(jpg|png|webp|pdf)$/.test(filename))return new Response('Not found',{status:404});
  try{
    const file=await readFile(path.join(dataDirectory(),'uploads',filename));
    const ext=filename.split('.').pop();
    return new Response(file,{headers:{'Content-Type':ext==='pdf'?'application/pdf':ext==='jpg'?'image/jpeg':'image/'+ext,...(ext==='pdf'?{'Content-Disposition':'attachment; filename="brochure.pdf"'}:{}),'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
  }catch{return new Response('Not found',{status:404});}
}
