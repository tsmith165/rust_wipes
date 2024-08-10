'use client';

import React from 'react';
import { useIsAdmin } from './useIsAdmin';

interface AdminProtectProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const AdminProtect: React.FC<AdminProtectProps> = ({ children, fallback }) => {
    const { isAdmin, isLoaded } = useIsAdmin();

    if (!isLoaded) {
        return null; // or a loading spinner
    }

    if (!isAdmin) {
        return fallback || null;
    }

    return <>{children}</>;
};

export default AdminProtect;
