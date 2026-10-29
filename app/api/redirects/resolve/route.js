import {NextResponse} from 'next/server';import {database} from '@/server/database';
export const runtime='nodejs';
export async function GET(request){const path=new URL(request.url).searchParams.get('path')||'';if(path.length>2000||!path.startsWith('/')||path.startsWith('//'))return NextResponse.json({redirect:null});const row=database().prepare('SELECT to_url,status FROM redirects WHERE from_path=? AND enabled=1').get(path);return NextResponse.json({redirect:row||null},{headers:{'Cache-Control':'no-store'}});}
