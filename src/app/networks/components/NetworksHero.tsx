'use client';

import React from 'react';
import HeroSection from '@/components/ui/HeroSection';

export default function NetworksHero() {
    return (
        <HeroSection
            title="Server Networks"
            description="Browse popular Rust server networks and their current servers"
            backgroundType="particles"
            particleColor="rgba(153, 27, 27, 1)"
            particleCount={80}
            buttons={[
                {
                    text: 'Browse Networks',
                    link: '#networks-carousel',
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
