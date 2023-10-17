module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#dc2626', // red-600
                secondary: '#991b1b', // red-800
                tertiary: '#7f1d1d', // red-900

                light: '#a8a29e', // stone-400
                medium: '#3f3f46', // stone-700
                dark: '#1c1917', // stone-900

                'hot-wipe': '#dc2626', // red-600
                'cool-wipe': '#f97316', // orange-500
                'cold-wipe': '#fde047', // yellow-500

                link: '#57aaf3', // unvisited link color,
                visited: '#be23ae', // visited link color
            },
            screens: {
                'md-nav': '833px',
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
};
