import {notFound} from 'next/navigation';
import ContentList from '@/components/admin/ContentList';
import {pluralKinds,collectionDefinitions} from '@/cms/collection-definitions';
export default async function Page({params}){const {collection}=await params,kind=pluralKinds[collection];if(!kind)notFound();return <ContentList kind={kind} title={collectionDefinitions[kind].name} base={'/admin/catalog/'+collection}/>;}
