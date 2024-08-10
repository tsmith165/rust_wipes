import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export function useIsAdmin() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isUserLoaded && user) {
            const adminMembership = user.organizationMemberships.find((membership) => membership.role === 'org:admin');
            setIsAdmin(!!adminMembership);
        }
        setIsLoaded(isUserLoaded);
    }, [user, isUserLoaded]);

    return { isAdmin, isLoaded };
}
