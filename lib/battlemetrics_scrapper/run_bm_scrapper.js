const Scrapper = require('./bm_scrapper.js');

const scrapper = new Scrapper({
    maxDaysOld: 150,
    minRank: 5000 
});

scrapper.run().then(() => {
    console.log('Scrapper has finished running.');
}).catch(err => {
    console.log('Something went wrong:', err);
});