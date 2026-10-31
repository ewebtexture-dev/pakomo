import {reviewersSchema} from '@/cms/blog-features';
import {socialSchema,gallerySettingsSchema} from '@/cms/features';
import {extractMapEmbed} from '@/cms/location';
import {NextResponse,after} from 'next/server';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {requireAdmin,readJson,apiError,HttpError} from '@/server/http';
import {getSettings,setSettings,smtpSettings,saveSmtp} from '@/server/settings';
import {cleanPayload} from '@/server/cms';
import {deliverMail,processMailQueue} from '@/server/mail';
export const runtime='nodejs';
const contactSchema=z.object({mapEmbed:z.string().transform(extractMapEmbed).refine(v=>!v||/^https:\/\/www\.google\.com\/maps\/embed(?:[/?]|$)/.test(v),'Use a Google Maps embed URL or iframe.'),mapLink:z.string().url().refine(v=>/^https:\/\/(maps\.app\.goo\.gl\/|(?:www\.)?google\.com\/maps)/.test(v),'Use a Google Maps link.'),latitude:z.coerce.number().min(-90).max(90),longitude:z.coerce.number().min(-180).max(180)}).passthrough();
const scopes=['header','footer','contact','seo','schema','scripts','menus','account','social','gallery','reviewers'];
export async function GET(request){try{await requireAdmin(request,['super_admin']);const scope=new URL(request.url).searchParams.get('scope')||'contact';if(![...scopes,'smtp'].includes(scope))throw new HttpError(422,'Invalid settings group.');return NextResponse.json({settings:scope==='smtp'?smtpSettings(true):getSettings(scope)},{headers:{'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
export async function PUT(request){try{const actor=await requireAdmin(request,['super_admin']),body=await readJson(request,200000),scope=z.enum([...scopes,'smtp']).parse(body.scope);if(body.action==='test'){await deliverMail({to:z.string().email().parse(body.email),subject:'PAKMOO SMTP test',text:'Your SMTP settings are working.'});return NextResponse.json({message:'Test email sent.'});}if(body.action==='retry'){after(processMailQueue);return NextResponse.json({message:'Email queue scheduled.'});}if(scope==='smtp')saveSmtp(body.settings,actor);else{const value=scope==='reviewers'?reviewersSchema.parse(body.settings):scope==='contact'?contactSchema.parse({...body.settings,mapEmbed:body.settings.mapEmbed||'',mapLink:body.settings.mapLink||'https://maps.app.goo.gl/fhGb3YTsKg9ZsC4z5',latitude:body.settings.latitude??28.6856046,longitude:body.settings.longitude??77.421174}):scope==='social'?socialSchema.parse(body.settings):scope==='gallery'?gallerySettingsSchema.parse(body.settings):scope==='scripts'?body.settings:cleanPayload(body.settings);setSettings(scope,value,actor);}revalidatePath('/','layout');return NextResponse.json({message:'Settings saved.'});}catch(e){return apiError(e);}}
