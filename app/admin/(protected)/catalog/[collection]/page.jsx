import {notFound} from 'next/navigation';
import GalleryManager from '@/components/admin/GalleryManager';
import ContentList from '@/components/admin/ContentList';
import {pluralKinds,collectionDefinitions} from '@/cms/collection-definitions';
export default async function Page({params}){const {collection}=await params,kind=pluralKinds[collection];if(!kind)notFound();if(kind==='gallery')return <GalleryManager/>;return <ContentList kind={kind} title={collectionDefinitions[kind].name} base={'/admin/catalog/'+collection}/>;}
