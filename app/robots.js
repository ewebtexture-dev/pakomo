import { siteUrl } from '@/server/posts';
export const dynamic='force-dynamic';
export default function robots(){return {rules:[{userAgent:'*',allow:'/',disallow:['/admin','/login','/api/']}],sitemap:siteUrl()+'/sitemap.xml'};}
