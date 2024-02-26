export const metadata = {
    title: 'Rust Wipes - Recent Wipes',
    description:
        'Keep track of the servers that just wiped so you can find a fresh server to play on! We offer free auto-refresh, sound notifications, and filtering!',
    icons: {
        icon: '/rust_hazmat_icon.png',
    },
};

import React from 'react';
import PropTypes from 'prop-types';
import PageLayout from '@/components/layout/PageLayout';
import RecentConfirmedWipesPage from '@/components/pages/recent/RecentConfirmedWipesPage';

// Adjusted to directly use props for searchParams
export default function Page(props) {
    // Extracting searchParams from props
    const { searchParams } = props;

    return (
        <PageLayout page_title="Recent Wipes" page="recent">
            <RecentConfirmedWipesPage searchParams={searchParams} />
        </PageLayout>
    );
}

Page.propTypes = {
    searchParams: PropTypes.object,
};
