import {redirect} from 'next/navigation';
import {currentAdmin} from '@/server/auth';
import AdminShell from '@/components/admin/AdminShell';
export default async function ProtectedAdminLayout({children}){const admin=await currentAdmin();if(!admin)redirect('/admin/login');return <AdminShell admin={admin}>{children}</AdminShell>;}
