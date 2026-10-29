import {notFound} from 'next/navigation';import {ensureCmsSeed} from '@/server/bootstrap';import {publicContentBySlug} from '@/server/cms';import ProductsPage from '../../page';
export default async function Page({params}){ensureCmsSeed();const row=publicContentBySlug('category',decodeURIComponent((await params).slug));if(!row)notFound();return <ProductsPage initialCategory={row.key}/>;}
