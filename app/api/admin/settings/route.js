import {NextResponse,after} from 'next/server';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {requireAdmin,readJson,apiError,HttpError} from '@/server/http';
import {getSettings,setSettings,smtpSettings,saveSmtp} from '@/server/settings';
import {cleanPayload} from '@/server/cms';
import {deliverMail,processMailQueue} from '@/server/mail';
export const runtime='nodejs';
const scopes=['header','footer','contact','seo','schema','scripts','menus','account'];
export async function GET(request){try{await requireAdmin(request,['super_admin']);const scope=new URL(request.url).searchParams.get('scope')||'contact';if(![...scopes,'smtp'].includes(scope))throw new HttpError(422,'Invalid settings group.');return NextResponse.json({settings:scope==='smtp'?smtpSettings(true):getSettings(scope)},{headers:{'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
export async function PUT(request){try{const actor=await requireAdmin(request,['super_admin']),body=await readJson(request,200000),scope=z.enum([...scopes,'smtp']).parse(body.scope);if(body.action==='test'){await deliverMail({to:z.string().email().parse(body.email),subject:'PAKMOO SMTP test',text:'Your SMTP settings are working.'});return NextResponse.json({message:'Test email sent.'});}if(body.action==='retry'){after(processMailQueue);return NextResponse.json({message:'Email queue scheduled.'});}if(scope==='smtp')saveSmtp(body.settings,actor);else{const value=scope==='scripts'?body.settings:cleanPayload(body.settings);setSettings(scope,value,actor);}revalidatePath('/','layout');return NextResponse.json({message:'Settings saved.'});}catch(e){return apiError(e);}}
