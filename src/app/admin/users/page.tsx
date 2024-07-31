import type { Metadata } from 'next';
import { getUsers, fetchSteamProfile, UserWithKits } from './actions';
import PageLayout from '@/components/layout/PageLayout';
import { Users } from '@/app/admin/users/Users';

export const metadata: Metadata = {
    title: 'Rust Wipes - Manage Users',
    description: 'Manage users and their kits for Rust Wipes.',
    keywords: 'rust, rustwipes, user management, kits',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        images: '/og-image.png',
    },
};

interface UserWithSteamProfile extends UserWithKits {
    steamProfile: {
        name: string;
        avatarUrl: string;
        steamId: string;
    };
}

export default async function UsersPage() {
    const users = await getUsers();

    const usersWithProfiles: UserWithSteamProfile[] = await Promise.all(
        users.map(async (user) => {
            try {
                const steamProfile = await fetchSteamProfile(user.steam_id);
                return { ...user, steamProfile };
            } catch (error) {
                console.error(`Failed to fetch profile for user ${user.steam_id}:`, error);
                return {
                    ...user,
                    steamProfile: {
                        name: user.steam_user,
                        avatarUrl: '/default-avatar.png', // Provide a default avatar image
                        steamId: user.steam_id,
                    },
                };
            }
        }),
    );

    return (
        <PageLayout page="/admin/users">
            <Users users={usersWithProfiles} />
        </PageLayout>
    );
}

export const revalidate = 60; // disable cache for this page
