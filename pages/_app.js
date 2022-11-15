import React from 'react';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Script from 'next/script'
import * as gtag from '../lib/gtag'
import { AppProps } from 'next/app';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import '../styles/globals/globals.scss'
import Layout from '../src/components/layout/Layout'

const queryClient = new QueryClient();

const App = ({ Component, pageProps }) => {
  const router = useRouter()
  const [url, setUrl] = useState(router.pathname)

  useEffect(() => {
    const handleRouteChange = (url) => {
      console.log(`Sending analytics call with url: ${url}`)
      gtag.pageview(url)
      setUrl(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Layout url={url}>
        <Component {...pageProps}/>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
