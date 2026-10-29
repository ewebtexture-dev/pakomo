import {NextResponse,after} from 'next/server';
import {z} from 'zod';
import {assertSameOrigin,readJson,apiError,HttpError} from '@/server/http';
import {issueOtp,verifyOtp,resetPassword,genericOtpMessage} from '@/server/otp';
import {rateLimit,requestIp} from '@/server/security';
import {processMailQueue} from '@/server/mail';
export const runtime='nodejs';
export async function POST(request){try{assertSameOrigin(request);const ip=requestIp(request);if(!rateLimit('otp-endpoint:'+ip,30,900000))throw new HttpError(429,'Please try again later.');const body=await readJson(request,4096);const action=z.enum(['request','verify','reset']).parse(body.action);if(action==='request'){const email=z.string().email().max(250).parse(body.email);issueOtp(email,'reset',ip);after(processMailQueue);return NextResponse.json({message:genericOtpMessage});}if(action==='verify'){const grant=verifyOtp(z.string().email().parse(body.email),z.string().regex(/^\d{6}$/).parse(body.code));if(!grant)throw new HttpError(422,'Invalid or expired verification code.');return NextResponse.json({grant});}const ok=resetPassword(z.string().regex(/^[a-f0-9]{64}$/).parse(body.grant),z.string().min(8).max(72).parse(body.password));if(!ok)throw new HttpError(422,'The reset session expired. Request a new code.');after(processMailQueue);return NextResponse.json({message:'Password changed. Sign in with your new password.'});}catch(e){return apiError(e);}}
