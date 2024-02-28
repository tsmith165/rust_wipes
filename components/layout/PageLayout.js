import Navbar from './Navbar';
import React from 'react';
import PropTypes from 'prop-types';

// eslint-disable-next-line no-unused-vars
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function PageLayout({ children, page }) {
    return (
        <div className="p-0">
            <main className="min-h-full bg-grey">
                <Navbar page={page || ''} />
                <div className="relative h-[calc(100vh-97px)] w-full md-nav:h-[calc(100vh-100px)]">{children}</div>
            </main>
        </div>
    );
}

PageLayout.propTypes = {
    children: PropTypes.node.isRequired,
    page: PropTypes.string,
};
