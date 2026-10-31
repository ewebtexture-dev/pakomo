import {notFound} from 'next/navigation';import {listContent} from '@/server/cms';import {ensureCmsSeed} from '@/server/bootstrap';import GalleryAlbum from '@/components/gallery/GalleryAlbum';import {albumImages} from '@/cms/gallery';
export const dynamic='force-dynamic';
export default async function Page({params}){ensureCmsSeed();const {slug}=await params,album=listContent('gallery',true).find(r=>r.slug===slug);if(!album||!albumImages(album.payload).length)notFound();return <GalleryAlbum album={album.payload}/>;}
