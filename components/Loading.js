import React from 'react';

const Loading = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-secondary">
            <div className="border-primary_light h-32 w-32 animate-spin rounded-full border-b-2 border-t-2"></div>{' '}
        </div>
    );
};

export default Loading;
