const fs = require('fs');
const SCHEDULER_DELAY = 24 * 60 * 60 * 1000; // 24 hour
const CONFIG_PATH = './config.json';

function readData() {
    return JSON.parse(fs.readFileSync(CONFIG_PATH));
}

function updateData() {
    module.exports = readData();
    console.log('Config has been updated');
}

updateData() // Initialization of config with first execution
setInterval(updateData, SCHEDULER_DELAY);