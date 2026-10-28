import { readFile } from 'node:fs/promises';
import path from 'node:path';
export const runtime='nodejs';
export async function GET(request,{params}) {
  const {filename}=await params;
  if(!/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(filename))return new Response('Not found',{status:404});
  try{
    const file=await readFile(path.join(process.env.DATA_DIRECTORY || path.join(process.cwd(),'.data'),'uploads',filename));
    const ext=filename.split('.').pop();
    return new Response(file,{headers:{'Content-Type':ext==='jpg'?'image/jpeg':'image/'+ext,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
  }catch{return new Response('Not found',{status:404});}
}
