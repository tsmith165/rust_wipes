import PROJECT_CONSTANTS from '@/lib/constants';

export const navbar_menu_list: [string, string][] = [
    ['servers', 'Servers'],
    ['kits', 'Kits'],
    ['stats', 'Stats'],
    ['networks', 'Networks'],
    ['recent', 'Recent'],
    ['upcoming', 'Upcoming'],
];

export const menu_list: [string, string, string][] = [
    ['servers', 'Servers', '/servers'],
    ['kits', 'Kits', '/kits'],
    ['recent', 'Recent', '/recent?page=1&numServers=25&minPlayers=2&maxDist=5000&country=US'],
    ['upcoming', 'Upcoming', '/upcoming'],
    // ['networks', 'Networks', false, '/networks'],
];

export const admin_menu_list: [string, string, string][] = [
    ['servers', 'Servers', '/servers'],
    ['kits', 'Kits', '/kits'],
    ['recent', 'Recent', '/recent?page=1&numServers=25&minPlayers=2&maxDist=5000&country=US'],
    ['upcoming', 'Upcoming', '/upcoming'],
    ['manage', 'Manage', '/admin/manage'],
    ['edit', 'Edit', '/admin/edit'],
    ['users', 'Users', '/admin/users'],
    ['performance', 'Performance', '/admin/hosting/performance'],
    ['discord', 'Discord', PROJECT_CONSTANTS.CONTACT_DISCORD],
];

export default { navbar_menu_list, menu_list, admin_menu_list };
