import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';
import { getServerPerformanceData, ServerPerformanceData } from './actions';

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

export async function getInitialPerformanceData(recordsToDisplay: number = 250): Promise<ServerPerformanceData[]> {
    const { isAdmin, error } = await checkUserRole();
    if (!isAdmin) {
        console.error(error);
        return [];
    }
    return getServerPerformanceData(recordsToDisplay);
}
