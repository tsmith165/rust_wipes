export const metadata = {
    metadataBase: new URL('https://rustwipes.net'),
};

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

import '@/styles/globals.css';
import 'tailwindcss/tailwind.css';

import AppLayout from '@/components/layout/AppLayout';

function RootLayout({ children }) {
    console.log(`Loading Root Layout...`);

    return (
        <>
            <AppLayout>{children}</AppLayout>
        </>
    );
}

// Define PropTypes for RootLayout
RootLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default RootLayout;
