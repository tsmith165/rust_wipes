import PROJECT_CONSTANTS from '@/lib/constants';

export const navbar_menu_list: [string, string, string][] = [
    ['servers', 'Servers', '/servers'],
    ['kits', 'Kits', '/kits?type=monthly&kit=2'],
    ['wheel', 'Wheel', '/gambling/wheel'],
    ['stats', 'Stats', '/stats'],
    ['networks', 'Networks', '/networks'],
    ['recent', 'Recent', '/recent?page=1&numServers=25&minPlayers=2&maxDist=5000&country=US'],
    ['upcoming', 'Upcoming', '/upcoming'],
];

export const menu_list: [string, string, string][] = [
    ['servers', 'Servers', '/servers'],
    ['kits', 'Kits', '/kits?type=monthly&kit=2'],
    ['wheel', 'Wheel', '/gambling/wheel'],
    ['slot', 'Slot', '/gambling/slot'],
    ['stats', 'Stats', '/stats'],
    ['networks', 'Networks', '/networks'],
    ['recent', 'Recent', '/recent?page=1&numServers=25&minPlayers=2&maxDist=5000&country=US'],
    ['upcoming', 'Upcoming', '/upcoming'],
    ['faq', 'FAQ', '/faq'],
];

export const admin_menu_list: [string, string, string][] = [
    ['servers', 'Servers', '/servers'],
    ['kits', 'Kits', '/kits?type=monthly&kit=2'],
    ['wheel', 'Wheel', '/gambling/wheel'],
    ['slot', 'Slot', '/gambling/slot'],
    ['stats', 'Stats', '/stats'],
    ['networks', 'Networks', '/networks'],
    ['recent', 'Recent', '/recent?page=1&numServers=25&minPlayers=2&maxDist=5000&country=US'],
    ['upcoming', 'Upcoming', '/upcoming'],
    ['faq', 'FAQ', '/faq'],
    ['manage', 'Manage', '/admin/manage'],
    ['edit', 'Edit', '/admin/edit'],
    ['users', 'Users', '/admin/users'],
    ['performance', 'Performance', '/admin/hosting/performance'],
    ['tests', 'Tests', '/admin/test'],
];

export default { navbar_menu_list, menu_list, admin_menu_list };
