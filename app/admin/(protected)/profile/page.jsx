import ProfilePanel from '@/components/admin/ProfilePanel';import {currentAdmin} from '@/server/auth';export default async function Page(){return <ProfilePanel admin={await currentAdmin()}/>;}
