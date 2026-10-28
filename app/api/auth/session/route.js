import { NextResponse } from 'next/server';
import { currentAdmin } from '@/server/auth';
export const runtime='nodejs';
export async function GET() {
  const admin=await currentAdmin();
  if(!admin)return NextResponse.json({error:'Please sign in.'},{status:401});
  return NextResponse.json({admin:{...admin,name:'PAKMOO Admin',email:'admin@pakmoo.com'}},{headers:{'Cache-Control':'no-store'}});
}
