import {notFound} from 'next/navigation';
import BlogListing from '@/components/blog/BlogListing';
import {ensureCmsSeed} from '@/server/bootstrap';
import {publicContentBySlug} from '@/server/cms';
import {blogListingData,listingMetadata} from '@/server/blog-listing';
import {pageNumber} from '@/cms/blog-features';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function generateMetadata({params,searchParams}){const {slug}=await params;return listingMetadata('/blog/category/'+encodeURIComponent(slug),pageNumber((await searchParams)?.page));}
export default async function Page({params,searchParams}){ensureCmsSeed();const {slug}=await params,row=publicContentBySlug('blogcategory',slug);if(!row)notFound();return <BlogListing model={blogListingData({page:pageNumber((await searchParams)?.page),category:row,path:'/blog/category/'+encodeURIComponent(slug)})}/>;}
