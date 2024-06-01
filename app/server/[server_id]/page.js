export const metadata = {
    title: 'Rust Wipes - Server Details',
    description: 'Detailed information about the specific Rust server',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
};

import React from 'react';
import PropTypes from 'prop-types';

import PageLayout from '@/components/layout/PageLayout';
import ServerInfoPage from '@/app/server/ServerInfoPage';

// eslint-disable-next-line no-unused-vars
export default function ServerPage({ params, searchParams }) {
    return (
        <PageLayout page={'server'} params={params} searchParams={searchParams}>
            <ServerInfoPage params={params} />
        </PageLayout>
    );
}

ServerPage.propTypes = {
    params: PropTypes.object,
    searchParams: PropTypes.object,
};
