const images = [
    { src: '/rust_stock_game_images/rust_stock_2.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_3.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_5.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_6.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_7.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_4.webp', width: 1920, height: 1080 },
    { src: '/rust_stock_game_images/rust_stock_1.webp', width: 1920, height: 1080 },
];

const toolsData = [
    {
        title: 'VIP Kits',
        description: 'Get a head start with our premium kit selection.',
        href: '/kits',
        icon: '🎁',
    },
    {
        title: 'Player Statistics',
        description: 'Track your performance across all our servers.',
        href: '/stats',
        icon: '📊',
    },
    {
        title: 'Wheel',
        description: 'Try your luck with our gambling wheel.',
        href: '/gambling/wheel',
        icon: '🎡',
    },
    {
        title: 'Slots',
        description: 'Spin to win with our slot machine.',
        href: '/gambling/slot',
        icon: '🎰',
    },
];

const serverFinderData = [
    {
        title: 'Recent Wipes',
        description: 'Find freshly wiped servers with our real-time tracking system.',
        href: '/recent',
        icon: '🔄',
    },
    {
        title: 'Upcoming Wipes',
        description: 'Plan ahead with our wipe schedule tracker.',
        href: '/upcoming',
        icon: '📅',
    },
    {
        title: 'Server Networks',
        description: 'Browse popular Rust server networks and communities.',
        href: '/networks',
        icon: '🌐',
    },
];

const serverData = {
    '1.5x': [
        {
            title: '1.5x Trio',
            description: 'Perfect for small groups with balanced rates.',
            wipeSchedule: 'Thursday / Sunday',
            href: '/servers',
        },
        {
            title: '1.5x Duo Offset',
            description: 'Ideal for duos seeking a fresh start.',
            wipeSchedule: 'Friday / Monday',
            href: '/servers',
        },
    ],
    '2x': [
        {
            title: '2x Trio',
            description: 'Enhanced rates for trio gameplay.',
            wipeSchedule: 'Thursday / Sunday',
            href: '/servers',
        },
        {
            title: '2x Duo Offset',
            description: 'Boosted rates for duo action.',
            wipeSchedule: 'Friday / Monday',
            href: '/servers',
        },
    ],
    '3x': [
        {
            title: '3x Duo',
            description: 'High-paced duo gameplay.',
            wipeSchedule: 'Thursday / Sunday',
            href: '/servers',
        },
        {
            title: '3x Trio Offset',
            description: 'Fast-paced trio action.',
            wipeSchedule: 'Friday / Monday',
            href: '/servers',
        },
    ],
    Other: [
        {
            title: 'Creative / Build',
            description: 'Perfect for building and testing designs.',
            wipeSchedule: 'Wednesday',
            href: '/servers',
        },
        {
            title: 'Arena / AimTrain',
            description: 'Practice your combat skills.',
            wipeSchedule: 'Wednesday',
            href: '/servers',
        },
    ],
};

export { images, toolsData, serverFinderData, serverData };
