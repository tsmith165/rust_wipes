import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function withRouter(Component) {
    return function WrappedComponent(props) {
        const [hasMounted, setHasMounted] = useState(false);
        const router = useRouter();

        useEffect(() => {
            setHasMounted(true);
        }, []);

        if (!hasMounted) {
            return <Component {...props} />;
        }

        return <Component {...props} router={router} />;
    }
}

export default withRouter;
