import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

export async function checkUserRole(): Promise<{ isAdmin: boolean; error?: string | undefined }> {
    const { userId } = auth();
    if (!userId) {
        return { isAdmin: false, error: 'User is not authenticated. Cannot view server performance.' };
    }
    const hasAdminRole = await isClerkUserIdAdmin(userId);
    if (!hasAdminRole) {
        return { isAdmin: false, error: 'User does not have the admin role. Cannot view server performance.' };
    }
    return { isAdmin: true };
}
