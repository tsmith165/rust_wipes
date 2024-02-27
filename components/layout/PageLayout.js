import Navbar from './Navbar';
import React from 'react';
import PropTypes from 'prop-types';

export default function PageLayout({ children }) {
    return (
        <div className="p-0">
            <main className="min-h-full bg-grey">
                <Navbar />
                <div className="relative h-[calc(100vh-99px)] w-full md-nav:h-[calc(100vh-100px)]">{children}</div>
            </main>
        </div>
    );
}

PageLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
