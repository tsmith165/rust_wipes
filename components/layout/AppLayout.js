import React from 'react';
import PropTypes from 'prop-types';
import Script from 'next/script';
import * as gtag from '../../lib/gtag';

export default function AppLayout({ children }) {
    return (
        <html lang="en">
            <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`} />
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
            <body>{children}</body>
        </html>
    );
}

AppLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
