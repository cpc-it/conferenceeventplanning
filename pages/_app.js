import '../faust.config';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaustProvider } from '@faustwp/core';
import Script from 'next/script';
import 'normalize.css/normalize.css';
import '../styles/main.scss';
import ThemeStyles from 'components/ThemeStyles/ThemeStyles';

const GA_TRACKING_ID = 'G-121M5PNKJP';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const normalizedPath = router.asPath.split('?')[0].replace(/\/+$/, '') || '/';
  const shouldLoadTeamLightbox =
    normalizedPath === '/plan/team' || normalizedPath.startsWith('/plan/team/');

  // -------------------------------
  // Google Analytics route tracking
  // -------------------------------
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', GA_TRACKING_ID, { page_path: url });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <>
      {/* ✅ Google Analytics scripts */}
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {shouldLoadTeamLightbox ? (
        <Script
          src="/team-lightbox.js?v=20260922-2"
          strategy="afterInteractive"
        />
      ) : null}

      <ThemeStyles />
      <FaustProvider pageProps={pageProps}>
        <Component {...pageProps} key={normalizedPath} />
      </FaustProvider>
    </>
  );
}
