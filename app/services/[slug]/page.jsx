import {notFound} from 'next/navigation';import {ensureCmsSeed} from '@/server/bootstrap';import {publicContentBySlug} from '@/server/cms';import ServiceDetail from '@/components/cms/ServiceDetail';
export default async function Page({params}){ensureCmsSeed();const row=publicContentBySlug('service',(await params).slug);if(!row)notFound();return <ServiceDetail service={row.payload}/>;}
