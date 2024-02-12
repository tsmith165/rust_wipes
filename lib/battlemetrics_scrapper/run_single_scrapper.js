const SingleScrapper = require('./scrapper_single.js');

const scrapper = new SingleScrapper({
    max_days_old: 150,
    min_rank: 5000,
});

scrapper
    .run()
    .then(() => {
        console.log('Scrapper has finished running.');
    })
    .catch((err) => {
        console.log('Something went wrong:', err);
    });
