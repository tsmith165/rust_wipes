module.exports = {
    apps: [
        {
            name: 'rust-wipes-scraper',
            script: './lib/battlemetrics_scraper/run_simple_bm_scraper.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
