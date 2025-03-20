import React from 'react';
import { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';

const PAGE_NAME = 'When Do Rust Servers Wipe?';

export const metadata: Metadata = {
    title: `Rust Wipes - ${PAGE_NAME}`,
    description:
        'Discover when Rust servers wipe, why wipes occur, and how they impact your gameplay. Stay informed with our comprehensive guide to Rust server wipes.',
    keywords:
        'rust server wipes, when do rust servers wipe, how to find rust server wipes, rust wipe schedule, rust forced wipes, rust server reset, rust update, rust gameplay, rust monthly wipe, rust map wipe, rust blueprint wipe',
    applicationName: 'Rust Wipes',
    icons: {
        icon: '/rust_hazmat_icon.png',
        shortcut: '/rust_hazmat_icon.png',
    },
    openGraph: {
        title: `Rust Wipes - ${PAGE_NAME}`,
        description: 'Your complete guide to Rust server wipes.',
        siteName: 'Rust Wipes',
        url: 'https://www.rustwipes.net/when-do-rust-servers-wipe',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Rust Wipes',
            },
        ],
        locale: 'en_US',
        type: 'article',
    },
};

export default function Page() {
    return (
        <PageLayout page={'/info/when-do-rust-servers-wipe'}>
            <div className="flex h-fit flex-col items-center justify-center bg-stone-800 px-8 py-16">
                <article className="prose text-stone-300 lg:prose-xl">
                    <h1 className="text-primary_light">When Do Rust Servers Wipe?</h1>
                    <p>
                        Rust server wipes are an integral part of the gameplay experience, ensuring a fresh start for all players and
                        keeping the game environment dynamic and competitive. In this guide, we&apos;ll delve into when Rust servers wipe,
                        why wipes occur, and how they affect your gameplay.
                    </p>

                    <h2 className="text-primary_light">What is a Rust Server Wipe?</h2>
                    <p>
                        A server wipe in Rust resets the game world to its initial state. This means all structures, items, and player
                        progress (including blueprints, depending on the wipe type) are removed. Wipes are essential to prevent the game
                        world from becoming overcrowded with player-built structures and to maintain server performance.
                    </p>

                    <h2 className="text-primary_light">When Do Rust Servers Wipe?</h2>
                    <p>
                        Rust servers follow different wipe schedules depending on the server type. The official Facepunch servers and most
                        community servers follow a predictable pattern:
                    </p>

                    <h3 className="text-primary">Forced Wipes (1st Thursday of Every Month)</h3>
                    <p>
                        Forced wipes occur on the first Thursday of every month and affect all Rust servers (both official and community).
                        These wipes coincide with the release of monthly game updates from Facepunch Studios, Rust&apos;s developers. The
                        exact time of the wipe is typically around{' '}
                        <strong className="text-primary_light">2 PM EST / 11 AM PST / 7 PM BST</strong>, but it can vary slightly depending
                        on the update release.
                    </p>

                    <h2 className="text-primary_light">Types of Wipes</h2>
                    <h3 className="text-primary">Map Wipe</h3>
                    <p>
                        A map wipe resets the game world, removing all player-built structures and items in the world. Players keep their
                        learned blueprints.
                    </p>
                    <h3 className="text-primary">Blueprint Wipe</h3>
                    <p>A blueprint wipe removes all learned blueprints from players, forcing everyone to start researching items again.</p>
                    <h3 className="text-primary">Full Wipe</h3>
                    <p>A full wipe includes both a map wipe and a blueprint wipe, resetting all progress.</p>

                    <h2 className="text-primary_light">Weekly, Bi-Weekly, and Monthly Wipes</h2>
                    <p>
                        While official servers follow a monthly wipe schedule, community and modded servers often have varied wipe
                        frequencies to cater to different playstyles and preferences.
                    </p>

                    <h3 className="text-primary">Weekly Wipes</h3>
                    <p>
                        Servers that wipe weekly offer a fast-paced environment where players can build and progress quickly, knowing that
                        the world resets every week. This schedule is ideal for players who enjoy rapid progression and frequent fresh
                        starts.
                    </p>

                    <h3 className="text-primary">Bi-Weekly Wipes</h3>
                    <p>
                        Bi-weekly wipes strike a balance between the rapid turnover of weekly wipes and the longer progression of monthly
                        wipes. Players have two weeks to establish themselves, engage in raids, and explore the world before it resets.
                    </p>

                    <h3 className="text-primary">Monthly Wipes</h3>
                    <p>
                        Monthly wipes align with the official server schedule, providing a longer-term gameplay experience. Players can
                        invest more time in building extensive bases, forming alliances, and engaging in prolonged conflicts.
                    </p>

                    <h2 className="text-primary_light">Community and Modded Servers</h2>
                    <p>
                        Community and modded servers are managed by independent administrators and may have different wipe schedules. Some
                        servers wipe weekly, bi-weekly, or on custom schedules. It&apos;s essential to check the server description or
                        website for specific wipe times.
                    </p>

                    <h2 className="text-primary_light">Why Do Wipes Occur?</h2>
                    <p>Wipes are necessary to:</p>
                    <ul>
                        <li>Maintain server performance by clearing out old structures.</li>
                        <li>Provide a level playing field for all players.</li>
                        <li>Introduce new content and map changes from updates.</li>
                    </ul>

                    <h2 className="text-primary_light">How to Stay Updated on Wipe Schedules</h2>
                    <p>To keep track of upcoming wipes:</p>
                    <ul>
                        <li>
                            Visit our{' '}
                            <a className="text-primary_light hover:cursor-grab hover:text-primary" href="/upcoming">
                                Upcoming Wipes
                            </a>{' '}
                            page for the latest schedules.
                        </li>
                        <li>Join server-specific Discord channels or forums.</li>
                        <li>Follow official Rust announcements on social media and the game&apos;s website.</li>
                    </ul>

                    <h2 className="text-primary_light">Conclusion</h2>
                    <p>
                        Understanding when Rust servers wipe helps you plan your gameplay and stay competitive. Whether you&apos;re a
                        seasoned veteran or a new player, staying informed ensures you&apos;re ready to dive back into the action after each
                        wipe.
                    </p>
                </article>
            </div>
        </PageLayout>
    );
}
