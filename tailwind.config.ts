import typography from '@tailwindcss/typography';
const plugin = require('tailwindcss/plugin');
import { withUt } from 'uploadthing/tw';

const radialGradientPlugin = plugin(function ({ matchUtilities, theme }: { matchUtilities: any; theme: any }) {
    matchUtilities(
        {
            // map to bg-radient-[*]
            'bg-radient': (value: any) => ({
                'background-image': `radial-gradient(${value},var(--tw-gradient-stops))`,
            }),
        },
        { values: theme('radialGradients') },
    );
});

export default withUt({
    content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary_light: '#dc2626', // red-600
                primary: '#991b1b', // red-800
                primary_dark: '#7f1d1d', // red-900
                secondary_light: '#a8a29e', // stone-400
                secondary: '#3f3f46', // stone-700
                secondary_dark: '#1c1917', // stone-900
                hot_wipe: '#dc2626', // red-600
                cool_wipe: '#f97316', // orange-500
                cold_wipe: '#fde047', // yellow-500
                white: '#ffffff', // white
                link: '#57aaf3', // unvisited link color,
                visited: '#be23ae', // visited link color
            },
            screens: {
                'md-nav': '841px',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 1s forwards',
            },
        },
    },
    mode: 'jit',
    plugins: [
        typography,
        plugin(function ({ addBase, theme, addUtilities }: { addBase: any; theme: any; addUtilities: any }) {
            // Custom gradeint utility classes
            const newUtilities = {
                '.gradient-primary-text': {
                    '@apply text-transparent bg-gradient-to-r bg-clip-text bg-gradient-to-r from-primary_light from-15% via-primary via-50% to-primary_light to-85%':
                        {},
                },
                '.gradient-primary-text-opp': {
                    '@apply text-transparent bg-gradient-to-r bg-clip-text bg-gradient-to-r from-primary from-15% via-primary_light via-50% to-primary to-85%':
                        {},
                },
                '.gradient-white-text': {
                    '@apply text-transparent bg-gradient-to-r bg-clip-text bg-gradient-to-r from-stone-300 from-15% via-stone-400 via-50% to-stone-300 to-85%':
                        {},
                },
            };

            addUtilities(newUtilities);
        }),
    ],
});
