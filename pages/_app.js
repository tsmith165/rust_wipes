import React from 'react';
import { useEffect, useState } from 'react'
import { Router, useRouter } from 'next/router'
import Script from 'next/script'
import * as gtag from '../lib/gtag'

import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
const queryClient = new QueryClient();

import '../styles/globals/globals.scss'
import Layout from '../src/components/layout/Layout'

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

  const [loading, setLoading] = React.useState(false);
  useEffect(() => {
    const start = () => {
      console.log("start loading");
      setLoading(true);
    };
    const end = () => {
      console.log("finished loading");
      setLoading(false);
    };
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);
    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
  }, []);
  return (
    <>
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
        <Script 
          async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7564404116158956"
          crossorigin="anonymous"
        />

        <Layout url={url}>
          <Component {...pageProps} loading={loading}/>
        </Layout>
      </QueryClientProvider>
    </>
  );
}

export default App;
