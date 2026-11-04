import {notFound} from 'next/navigation';
import {publicContentBySlug,sanitizeRich} from '@/server/cms';
import {ensureCmsSeed} from '@/server/bootstrap';

export default async function Page({params}) {
  ensureCmsSeed();
  const {slug}=await params;
  const page=publicContentBySlug('page',slug);
  if(!page||page.key==='global'||page.key.endsWith('-template'))notFound();
  return <article className="max-w-4xl mx-auto px-6 py-16"><h1 className="text-3xl font-bold mb-6">{page.payload.title||page.title}</h1><div className="prose max-w-none" dangerouslySetInnerHTML={{__html:sanitizeRich(page.payload.body||'')}}/></article>;
}
