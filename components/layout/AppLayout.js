'use client'

import React from 'react';

import Script from 'next/script';
import * as gtag from '../../lib/gtag';

class AppLayout extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <html lang="en">
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
                <body>
                    {this.props.children}
                </body>
            </html>
        );
    }
}

export default AppLayout;
