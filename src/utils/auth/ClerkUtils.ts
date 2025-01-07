import { clerkClient } from '@clerk/nextjs/server';
import type { OrganizationMembership } from '@clerk/nextjs/server';

async function captureClerkUserOrganizationMemberships(userId: string): Promise<OrganizationMembership[]> {
    try {
        // Get the clerk client instance first
        const clerk = await clerkClient();
        const paginatedMemberships = await clerk.users.getOrganizationMembershipList({ userId });
        return paginatedMemberships.data;
    } catch (error) {
        console.error('Error fetching organization memberships:', error);
        return [];
    }
}

export async function isClerkUserIdAdmin(userId: string): Promise<boolean> {
    if (userId) {
        const memberships = await captureClerkUserOrganizationMemberships(userId);
        if (memberships.length < 1) {
            console.log('No memberships found for user');
        } else {
            const adminMembership = memberships.find(
                (membership: OrganizationMembership) => membership.role === 'admin' || membership.role === 'org:admin',
            );
            if (adminMembership) {
                return true;
            }
        }
    }
    return false;
}
