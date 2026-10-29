import {redirect} from 'next/navigation';import {currentAdmin} from '@/server/auth';import SettingsPanel from '@/components/admin/SettingsPanel';
export default async function Page(){if((await currentAdmin())?.role!=='super_admin')redirect('/admin');return <SettingsPanel/>;}
