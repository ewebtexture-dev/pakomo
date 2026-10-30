import './globals.css';
import 'font-awesome/css/font-awesome.min.css';
import SiteLayout from '@/components/layout/SiteLayout';
import RootProviders from '@/components/RootProviders';
import ErrorBoundary from './ErrorBoundary';
import ContentProvider from '@/components/cms/ContentProvider';
import {publicCmsSnapshot} from '@/server/bootstrap';
import {headers} from 'next/headers';
import {cmsMetadata,schemaGraph} from '@/server/cms-seo';
import {getSettings} from '@/server/settings';
import {HeadScripts,BodyScripts} from '@/components/cms/GlobalScripts';
export const runtime='nodejs';
export const dynamic='force-dynamic';


export async function generateMetadata(){return cmsMetadata((await headers()).get('x-cms-path')||'/');}

export default async function RootLayout({ children }) {
  const path=(await headers()).get('x-cms-path')||'/',snapshot=publicCmsSnapshot(),scripts=getSettings('scripts');
  const maintenance=scripts.maintenance&&!/^\/(admin|login)(\/|$)/.test(path);
  return (
    <html lang="en">
      <head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schemaGraph(path)).replace(/</g,'\\u003c')}}/><HeadScripts settings={scripts}/></head>
      <body>
        <ErrorBoundary>
          <RootProviders>
            <ContentProvider value={snapshot}><SiteLayout>{maintenance?<div className="max-w-3xl mx-auto py-24 px-6"><h1 className="text-3xl font-bold">{scripts.maintenanceMessage||'We are updating our website. Please check back shortly.'}</h1></div>:children}</SiteLayout></ContentProvider>
          </RootProviders>
        </ErrorBoundary>
        <BodyScripts settings={scripts}/>
      </body>
    </html>
  );
}
