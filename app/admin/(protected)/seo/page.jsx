import RedirectManager from '@/components/admin/RedirectManager';import {currentAdmin} from '@/server/auth';import {redirect} from 'next/navigation';
export default async function Page(){if((await currentAdmin())?.role!=='super_admin')redirect('/admin');return <RedirectManager/>;}
