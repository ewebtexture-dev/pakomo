import {redirect} from 'next/navigation';
import {currentAdmin} from '@/server/auth';
import AdminShell from '@/components/admin/AdminShell';
import {headers} from 'next/headers';
export default async function ProtectedAdminLayout({children}){const admin=await currentAdmin();if(!admin)redirect('/admin/login');const path=(await headers()).get('x-cms-path')||'';if(/^\/admin\/preview\/[^/]+\/?$/.test(path))return <main data-blog-preview className="min-h-screen min-w-0 w-full bg-background text-foreground">{children}</main>;return <AdminShell admin={admin}>{children}</AdminShell>;}
