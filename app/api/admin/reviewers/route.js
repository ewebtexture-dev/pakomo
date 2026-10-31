import {NextResponse} from 'next/server';
import {requireAdmin,apiError} from '@/server/http';
import {getSettings} from '@/server/settings';
export const runtime='nodejs';
export async function GET(request){try{await requireAdmin(request);return NextResponse.json({reviewers:getSettings('reviewers').items||[]},{headers:{'Cache-Control':'no-store'}});}catch(error){return apiError(error);}}
