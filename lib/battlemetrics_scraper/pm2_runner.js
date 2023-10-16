const { exec } = require('child_process');

// This function will execute your script every 5000 milliseconds (or 5 seconds)
setInterval(() => {
    console.log('Starting the script...');
    exec('pm2 restart rust-wipes-scraper', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}, 5000);
