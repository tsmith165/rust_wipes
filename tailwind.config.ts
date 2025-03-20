import typography from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin';
import { withUt } from 'uploadthing/tw';
import { fontFamily } from 'tailwindcss/defaultTheme';
import tailwindcssAnimate from 'tailwindcss-animate';
import type { PluginAPI } from 'tailwindcss/types/config';

export default withUt({
    darkMode: ['class'],
    content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-geist-sans)', ...fontFamily.sans],
                mono: ['var(--font-geist-mono)', ...fontFamily.mono],
            },
            colors: {
                primary_light: '#dc2626',
                primary: '#991b1b',
                primary_dark: '#7f1d1d',

                st_darkest: '#0c0a09', // Dark slate
                st_dark: '#292524', // Slate
                st: '#44403c', // Medium slate
                st_light: '#78716c', // Light slate
                st_lightest: '#d6d3d1', // Lightest slate
                st_white: '#fafaf9', // Off-white

                hot_wipe: '#dc2626',
                cool_wipe: '#f97316',
                cold_wipe: '#fde047',

                link: '#57aaf3',
                visited: '#be23ae',
            },
            screens: {
                'md-nav': '841px',
                xs: '400px',
                xxs: '315px',
            },
            keyframes: {
                fadeIn: {
                    '0%': {
                        opacity: '0',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
            },
            animation: {
                fadeIn: 'fadeIn 1s forwards',
            },
            borderRadius: {
                '6xl': '3rem',
                '12xl': '6rem',
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },
    mode: 'jit',
    plugins: [
        typography,
        plugin(function ({ addUtilities }: PluginAPI) {
            // Custom gradient utility classes
            const newUtilities = {
                '.gradient-primary-text': {
                    '@apply text-transparent bg-clip-text bg-gradient-to-t from-primary_light to-primary': {},
                },
                '.gradient-primary-text-opp': {
                    '@apply text-transparent bg-clip-text bg-gradient-to-t from-primary_light to-primary': {},
                },
                '.gradient-st_white-text': {
                    '@apply text-transparent bg-clip-text bg-gradient-to-t from-stone-300 to-stone-500': {},
                },
            };

            addUtilities(newUtilities);
        }),
        // Radial gradient plugin
        plugin(function ({ matchUtilities, theme }: PluginAPI) {
            matchUtilities(
                {
                    // map to bg-radient-[*]
                    'bg-radient': (value: string) => ({
                        'background-image': `radial-gradient(${value},var(--tw-gradient-stops))`,
                    }),
                },
                { values: theme('radialGradients', {}) },
            );
        }),
        tailwindcssAnimate,
    ],
});
