import {NextResponse,after} from 'next/server';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {assertSameOrigin,readJson,apiError,HttpError} from '@/server/http';
import {database} from '@/server/database';
import {requestIp,rateLimit} from '@/server/security';
import {smtpSettings} from '@/server/settings';
import {enqueueMail,processMailQueue,mailConfigured} from '@/server/mail';
export const runtime='nodejs';
const input=z.object({name:z.string().trim().min(2).max(150),email:z.string().email().max(250),phone:z.string().trim().min(7).max(40),company:z.string().max(200).default(''),industry:z.string().max(150).default(''),product_interest:z.string().max(250).default(''),subject:z.string().max(250).default(''),message:z.string().trim().min(5).max(10000),source_url:z.string().max(2000).default(''),website:z.string().max(200).optional()});
export async function POST(request){try{assertSameOrigin(request);if(!rateLimit('enquiry:'+requestIp(request),10,3600000))throw new HttpError(429,'Please try again later.');const data=input.parse(await readJson(request,20000));if(data.website)return NextResponse.json({message:'Thank you. Your request has been received.'});const db=database(),id=randomUUID(),now=new Date().toISOString();db.prepare('INSERT INTO enquiries(id,name,email,phone,company,industry,product_interest,subject,message,source_url,created_at,updated_at,delivery_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,data.name,data.email,data.phone,data.company,data.industry,data.product_interest,data.subject,data.message,data.source_url,now,now,mailConfigured()?'pending':'not_configured');
 if(mailConfigured()){const c=smtpSettings();try{enqueueMail('enquiry',{to:c.receivers,cc:c.cc||undefined,bcc:c.bcc||undefined,replyTo:data.email,subject:c.subject.replaceAll('{{subject}}',data.subject||data.product_interest||'New enquiry').replaceAll(/[\r\n]/g,' '),text:Object.entries(data).filter(([key])=>key!=='website').map(([key,value])=>key+': '+value).join('\n')},id);if(c.autoReply)enqueueMail('auto-reply',{to:data.email,subject:'Thank you for contacting PAKMOO',text:c.autoReplyMessage});after(processMailQueue);}catch{db.prepare("UPDATE enquiries SET delivery_status='failed' WHERE id=?").run(id);}}
 return NextResponse.json({message:'Thank you. Your request has been received.',id},{status:201});}catch(e){return apiError(e);}}
