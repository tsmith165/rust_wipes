import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

const isPrivateRoute = createRouteMatcher(['/admin(/.*)', '/api/uploadthing']);

export default clerkMiddleware(async (auth, req) => {
    const currentPath = req.nextUrl.pathname;
    console.log('Current path:', currentPath);

    const isUploadthingRoute = currentPath === '/api/uploadthing';
    if (isUploadthingRoute) {
        console.log('Uploadthing route, proceeding...');
        return NextResponse.next();
    }

    const route_is_private = isPrivateRoute(req);
    console.log('Route is private?', route_is_private);

    if (route_is_private) {
        console.log('Route is private. Protecting with admin role.');
        const { userId } = auth();
        console.log('User ID:', userId);

        if (!userId) {
            console.log('User ID is null. Redirecting to sign-in page.');
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        const hasAdminRole = await isClerkUserIdAdmin(userId);
        console.log('User hasAdminRole:', hasAdminRole);

        if (!hasAdminRole) {
            console.log('User does not have admin role. Returning 403.');
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        console.log('User has admin role. Continuing...');
    } else {
        console.log('Public route. Proceeding...');
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin(.*)', '/api/uploadthing'],
};
