import {siteUrl} from '@/server/posts';import {getSettings} from '@/server/settings';
export const runtime='nodejs';export const dynamic='force-dynamic';
export default function robots(){const settings=getSettings('seo');return {rules:[{userAgent:'*',allow:settings.allowIndex===false?undefined:'/',disallow:settings.allowIndex===false?'/':['/admin','/login','/api/']}],sitemap:settings.sitemapEnabled===false?undefined:siteUrl()+'/sitemap.xml'};}
