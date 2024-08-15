import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

const isPrivateRoute = createRouteMatcher(['/admin(/.*)', '/api/uploadthing']);

export default clerkMiddleware((auth, req) => {
    const currentPath = req.nextUrl.pathname;
    console.log('Current route:', req.url);

    if (isPrivateRoute(req)) {
        console.log('Route is private. Protecting with admin role.');
        const { userId } = auth();

        if (!userId) {
            console.log('User ID is null. Redirecting to sign in page.');
            return NextResponse.redirect(new URL('/signin', req.url));
        }

        return isClerkUserIdAdmin(userId).then((hasAdminRole) => {
            if (!hasAdminRole) {
                console.log('User does not have admin role. Returning 403.');
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
            }
            console.log('User has admin role. Continuing...');
            return NextResponse.next();
        });
    }

    // For public routes, just continue without any additional checks
    console.log('Public route. Proceeding...');
    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
