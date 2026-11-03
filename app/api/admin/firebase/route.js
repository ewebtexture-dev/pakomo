import{NextResponse}from'next/server';
import{requireAdmin,apiError}from'@/server/http';
export const runtime='nodejs';
export async function GET(request){try{await requireAdmin(request,['super_admin']);return NextResponse.json({error:'Firebase is disconnected. Content and media are hosted on this server.'},{status:410,headers:{'Cache-Control':'no-store'}});}catch(error){return apiError(error);}}
export const PUT=GET;
