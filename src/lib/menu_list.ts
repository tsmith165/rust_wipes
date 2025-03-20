import {
    Server,
    Gift,
    CircleDot,
    BarChart3,
    Globe,
    Clock,
    Calendar,
    HelpCircle,
    Bell,
    Activity,
    Settings,
    Edit,
    Users,
    TestTube,
    ChevronRight,
} from 'lucide-react';

// Define interface for menu items
export interface MenuItem {
    id: string;
    label: string;
    href: string;
    icon: React.ElementType;
    description?: string;
    group?: string;
}

// Legacy array format for backward compatibility
export const navbar_menu_list: [string, string, string][] = [
    ['servers', 'Servers', '/servers'],
    ['kits', 'Kits', '/kits?type=monthly&kit=2'],
    ['slots', 'Slots', '/games/rusty-slots'],
    ['wheel', 'Wheel', '/games/wheel'],
    ['stats', 'Stats', '/stats'],
    ['networks', 'Networks', '/networks'],
    ['recent', 'Recent', '/recent?page=1&numServers=25&minPlayers=2&maxDist=5000&country=US'],
    ['upcoming', 'Upcoming', '/upcoming'],
];

// Main menu items with new object format including icons
export const menu_items: MenuItem[] = [
    {
        id: 'servers',
        label: 'Servers',
        href: '/servers',
        icon: Server,
        description: 'Browse our Rust servers',
        group: 'main',
    },
    {
        id: 'kits',
        label: 'Kits',
        href: '/kits?type=monthly&kit=2',
        icon: Gift,
        description: 'Browse available kits',
        group: 'main',
    },
    {
        id: 'wheel',
        label: 'Wheel',
        href: '/games/wheel',
        icon: CircleDot,
        description: 'Try your luck on the wheel',
        group: 'games',
    },
    {
        id: 'slots',
        label: 'Slots',
        href: '/games/rusty-slots',
        icon: CircleDot,
        description: 'Play Rusty Slots',
        group: 'games',
    },
    {
        id: 'stats',
        label: 'Stats',
        href: '/stats',
        icon: BarChart3,
        description: 'Server statistics',
        group: 'main',
    },
    {
        id: 'networks',
        label: 'Networks',
        href: '/networks',
        icon: Globe,
        description: 'Server networks',
        group: 'main',
    },
    {
        id: 'recent',
        label: 'Recent Wipes',
        href: '/recent?page=1&numServers=25&minPlayers=2&maxDist=5000&country=US',
        icon: Clock,
        description: 'Recently wiped servers',
        group: 'wipes',
    },
    {
        id: 'upcoming',
        label: 'Upcoming Wipes',
        href: '/upcoming',
        icon: Calendar,
        description: 'Upcoming server wipes',
        group: 'wipes',
    },
    {
        id: 'faq',
        label: 'FAQ',
        href: '/faq',
        icon: HelpCircle,
        description: 'Frequently asked questions',
        group: 'info',
    },
    {
        id: 'rules',
        label: 'Rules',
        href: '/rules',
        icon: ChevronRight,
        description: 'Server rules',
        group: 'info',
    },
];

// Admin menu items
export const admin_menu_items: MenuItem[] = [
    ...menu_items,
    {
        id: 'alerts',
        label: 'Alerts',
        href: '/admin/alerts',
        icon: Bell,
        description: 'Manage alerts',
        group: 'admin',
    },
    {
        id: 'status',
        label: 'Status',
        href: '/admin/status',
        icon: Activity,
        description: 'Server status',
        group: 'admin',
    },
    {
        id: 'manage',
        label: 'Manage',
        href: '/admin/manage',
        icon: Settings,
        description: 'Manage servers',
        group: 'admin',
    },
    {
        id: 'edit',
        label: 'Edit',
        href: '/admin/edit',
        icon: Edit,
        description: 'Edit content',
        group: 'admin',
    },
    {
        id: 'users',
        label: 'Users',
        href: '/admin/users',
        icon: Users,
        description: 'Manage users',
        group: 'admin',
    },
    {
        id: 'tests',
        label: 'Tests',
        href: '/admin/test',
        icon: TestTube,
        description: 'Run tests',
        group: 'admin',
    },
];

// Legacy menu list arrays for backward compatibility
export const menu_list: [string, string, string][] = menu_items.map((item) => [item.id, item.label, item.href]);
export const admin_menu_list: [string, string, string][] = admin_menu_items.map((item) => [item.id, item.label, item.href]);

const menuExports = { navbar_menu_list, menu_list, admin_menu_list, menu_items, admin_menu_items };
export default menuExports;
