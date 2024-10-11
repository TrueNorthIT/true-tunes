import React, { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'

import '../styles/globals.css'
import Layout from '../components/layout/Layout';
import { ChartBarIcon, Cog6ToothIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';


const navigationMap = [
  { name: 'Music', href: '/music', current: true, icon: MusicalNoteIcon },
  { name: 'Stats', href: '/stats', current: false, icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', current: false, icon: Cog6ToothIcon },

];

function MyApp({ Component, pageProps }: AppProps) {

  const router = useRouter();
  const [navigation, setNavigation] = useState(navigationMap);

  const stripTrailingSlash = (url: string) => {
    return url.endsWith('/') && url !== '/' ? url.slice(0, -1) : url;
  };

  // Update the `current` property in the navigation based on the current path
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      setNavigation((prevNavigation) =>
        prevNavigation.map((item) => ({
          ...item,
          current: stripTrailingSlash(item.href) === stripTrailingSlash(url),
        }))
      );
      console.log('handleRouteChange', url);
    };

    // Set current page when the app loads
    handleRouteChange(router.pathname);

    // Listen for route changes and update `current` link
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      // Clean up the event listener
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.pathname]);

  return (
    <div className='h-screen overflow-y-hidden'>

      <Layout navigation={navigation}>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}

export default MyApp;

