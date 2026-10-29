import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { requireAdmin, readBody, apiError, HttpError } from '@/server/http';
import sharp from 'sharp';
import {dataDirectory} from '@/server/data-directory';
import {database} from '@/server/database';
export const runtime='nodejs';
export async function POST(request) {
  try {
    const actor=await requireAdmin(request);
    if(Number(request.headers.get('content-length'))>6*1024*1024)throw new HttpError(413,'Images must be no larger than 5 MB.');
    if(!request.headers.get('content-type')?.startsWith('multipart/form-data;'))throw new HttpError(415,'Send a multipart image upload.');
    const body=await readBody(request,6*1024*1024);
    const form=await new Request(request.url,{method:'POST',headers:{'Content-Type':request.headers.get('content-type')},body}).formData();const file=form.get('image');const webp=form.get('format')==='webp';
    if(!file || typeof file.arrayBuffer!=='function' || !file.size || file.size>5*1024*1024)throw new HttpError(422,'Choose a JPG, PNG, or WebP image up to 5 MB.');
    const buffer=Buffer.from(await file.arrayBuffer());
    let ext;
    if(buffer[0]===0xff && buffer[1]===0xd8 && buffer[2]===0xff)ext='jpg';
    else if(buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';
    else if(buffer.toString('ascii',0,4)==='RIFF' && buffer.toString('ascii',8,12)==='WEBP')ext='webp';
    else if(buffer.toString('ascii',4,8)==='ftyp'&&/avif|avis/.test(buffer.toString('ascii',8,32)))ext='webp';else throw new HttpError(422,'Only valid JPG, PNG, WebP, and AVIF images are allowed.');if(webp)ext='webp';
    const directory=path.join(dataDirectory(),'uploads');
    await mkdir(directory,{recursive:true});
    const id=randomUUID(),filename=id+'.'+ext;
    let optimized,metadata;try{const image=sharp(buffer,{limitInputPixels:40000000}).rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true});optimized=await (ext==='jpg'?image.jpeg({quality:85}):ext==='png'?image.png({compressionLevel:9}):image.webp({quality:85})).toBuffer();metadata=await sharp(optimized).metadata();}catch{throw new HttpError(422,'This image could not be decoded. Choose a valid image.');}
    await writeFile(path.join(directory,filename),optimized,{flag:'wx'});
    database().prepare('INSERT INTO media(id,filename,url,original_name,mime,bytes,width,height,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,filename,'/media/'+filename,String(file.name||filename).slice(0,250),ext==='jpg'?'image/jpeg':'image/'+ext,optimized.length,metadata.width,metadata.height,actor.id,new Date().toISOString());
    const blurDataURL='data:image/webp;base64,'+(await sharp(optimized).resize(16,12,{fit:'inside'}).webp({quality:30}).toBuffer()).toString('base64');
    return NextResponse.json({blurDataURL,url:'/media/'+filename,id,width:metadata.width,height:metadata.height,warning:metadata.width<640||metadata.height<480?'Small image: recommended at least 640 × 480; 1600 × 1200 is ideal.':''},{status:201});
  }catch(error){return apiError(error);}
}
