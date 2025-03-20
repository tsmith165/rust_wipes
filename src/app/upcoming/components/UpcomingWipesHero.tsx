'use client';

import React from 'react';
import HeroSection from '@/components/ui/HeroSection';

export default function UpcomingWipesHero() {
    return (
        <HeroSection
            title="Upcoming Wipes"
            description="Plan ahead with ease using our upcoming wipe tracker"
            backgroundType="particles"
            particleColor="rgba(153, 27, 27, 1)"
            particleCount={80}
            buttons={[
                {
                    text: 'View Servers',
                    link: '#servers-table',
                    iconName: 'ChevronDown',
                    animation: {
                        type: 'bounce',
                        delay: 0.5,
                    },
                },
            ]}
        />
    );
}
