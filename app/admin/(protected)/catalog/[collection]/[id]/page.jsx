import {notFound} from 'next/navigation';
import ContentEditor from '@/components/admin/ContentEditor';
import {pluralKinds} from '@/cms/collection-definitions';
export default async function Page({params}){const {collection,id}=await params,kind=pluralKinds[collection];if(!kind)notFound();return <ContentEditor kind={kind} id={id} base={'/admin/catalog/'+collection}/>;}
