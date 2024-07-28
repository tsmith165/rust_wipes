async function captureClerkUserOrganizationMemberships(userId: string) {
    console.log("Capturing user's organization memberships...");
    try {
        const response = await fetch(`https://api.clerk.com/v1/users/${userId}/organization_memberships?limit=100`, {
            headers: {
                Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return [];
        }

        const memberships = await response.json();

        // console.log('User Memberships:', memberships.data);
        return memberships;
    } catch (error) {
        console.error('Error fetching organization memberships:', error);
        return [];
    }
}

export async function isClerkUserIdAdmin(userId: string) {
    if (userId) {
        const user_organization_memberships = await captureClerkUserOrganizationMemberships(userId);
        // console.log('User Organization Memberships:', user_organization_memberships);
        if (user_organization_memberships.length < 1) {
            console.log('No memberships found for user');
        } else {
            let membership_data = user_organization_memberships.data[0];
            console.log('Membership Role:', membership_data.role);
            console.log('Membership Permissions:', membership_data.permissions);
            if (membership_data.role === 'org:admin') {
                return true;
            }
            if (membership_data.role === 'org:admin' || membership_data.permissions.includes('org:sys_domains:manage')) {
                return true;
            }
        }
    }
    // console.log('Is user admin:', isAdmin);
    return false;
}
