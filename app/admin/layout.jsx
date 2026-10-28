import { redirect } from 'next/navigation';
import { currentAdmin } from '@/server/auth';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export const metadata={title:'Admin | PAKMOO',robots:{index:false,follow:false}};
export default async function AdminLayout({children}) {
  if(!await currentAdmin())redirect('/login');
  return children;
}
