'use client';

import React from 'react';
import HeroSection from '@/components/ui/HeroSection';

export default function RecentWipesHero() {
    return (
        <HeroSection
            title="Recently Wiped Servers"
            description="Check out the latest servers that have been wiped"
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
