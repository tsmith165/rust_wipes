const SimpleScrapper = require('./simple_bm_scraper.js');

// Create an instance of SimpleScrapper
const scrapper = new SimpleScrapper({
    max_days_old: 150,
    min_rank: 5000,
});

// Function to start the scraper with error handling
function startScraper() {
    scrapper
        .run()
        .then(() => {
            console.log('Scrapper has finished running.');
        })
        .catch((err) => {
            console.error('Something went wrong:', err);
        });
}

// Run the startScraper function the first time
startScraper();

// Set an interval to run the scraper every 5 seconds (5000 milliseconds)
setInterval(startScraper, 5000);
