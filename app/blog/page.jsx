import BlogListing from '@/components/blog/BlogListing';
import {blogListingData,listingMetadata} from '@/server/blog-listing';
import {pageNumber} from '@/cms/blog-features';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function generateMetadata({searchParams}){return listingMetadata('/blog',pageNumber((await searchParams)?.page));}
export default async function BlogPage({searchParams}){return <BlogListing model={blogListingData({page:pageNumber((await searchParams)?.page)})}/>;}
