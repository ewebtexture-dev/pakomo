import './globals.css';
import SiteLayout from '@/components/layout/SiteLayout';
import RootProviders from '@/components/RootProviders';
import ErrorBoundary from './ErrorBoundary';


export const metadata = {
  title: 'PAKMOO Testing Instruments',
  description: 'Precision testing instruments and industry-standard laboratory solutions.',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'shortcut icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/favicon.ico' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <RootProviders>
            <SiteLayout>{children}</SiteLayout>
          </RootProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
