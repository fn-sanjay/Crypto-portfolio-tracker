import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = 'https://api.coingecko.com/api/v3/coins/markets';
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': process.env.API_KEY
    }
};
console.log("API Key from env:", process.env.API_KEY);


// Create the cache directory if it doesn't exist
const cacheDir = '../cache';
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
    console.log('Created cache directory.');
} else {
    console.log('Cache directory already exists.');
}

async function fetchAllCoins() {
    let coins = [];
    let page = 1;
    const requestsPerMinuteLimit = 30; // 30 requests per minute allowed
    const hourCooldown = 3600000; // 1 hour in milliseconds
    let fetchedAllCoins = false;

    console.log('Starting to fetch coins...');

    while (true) {
        // Reset fetchedAllCoins to false for a new round of fetching after cooldown
        fetchedAllCoins = false;

        // Fetch all pages until no more coins are left
        while (!fetchedAllCoins) {
            for (let i = 0; i < requestsPerMinuteLimit; i++) {
                console.log(`Fetching page ${page}...`);

                try {
                    const response = await fetch(`${url}?vs_currency=inr&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`, options);
                    
                    if (!response.ok) {
                        console.error(`Failed to fetch data from page ${page}: ${response.status} ${response.statusText}`);
                        break; // Stop if there's an error
                    }

                    const data = await response.json();
                    console.log(`Received ${data.length} coins from page ${page}.`);

                    // Add coins to the array if they are received, otherwise, it could cause miscounts
                    if (data.length > 0) {
                        coins = coins.concat(data);
                    }

                    console.log(`Total coins fetched so far: ${coins.length}`);

                    // If fewer than 250 coins are received, we've reached the end of the available coins
                    if (data.length < 250) {
                        console.log('No more coins to fetch. We have reached the end.');
                        fetchedAllCoins = true; // Set to true to stop the inner loop
                        break;
                    }

                    page++; // Move to the next page

                } catch (error) {
                    console.error(`Error occurred while fetching page ${page}:`, error);
                    console.log('Waiting for 60 seconds before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds before retrying
                    continue; // Retry the current page after waiting
                }
            }

            if (!fetchedAllCoins) {
                console.log('Waiting for 60 seconds to comply with API rate limits...');
                await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds before the next batch of 30 requests
            }
        }

        // Ensure that all coins are saved properly without being overwritten
        saveCoinsToFile(coins);

        // Log completion and initiate hour-long cooldown
        console.log(`Final total coins fetched: ${coins.length}`);
        console.log('Waiting for 1 hour before fetching data again...');

        // Clear coins array for the next fetch to capture any updates or changes
        coins = [];
        page = 1;

        // Wait for one hour before fetching again
        await new Promise(resolve => setTimeout(resolve, hourCooldown));
    }
}

// Function to save coin data to the JSON file
function saveCoinsToFile(coins) {
    const filePath = path.join(cacheDir, 'prices.json');
    try {
        // Sort coins by their rank or ID to ensure completeness and consistency
        const sortedCoins = coins.sort((a, b) => a.market_cap_rank - b.market_cap_rank);
        fs.writeFileSync(filePath, JSON.stringify(sortedCoins, null, 2));
        console.log(`All coin data has been saved to ${filePath}`);
    } catch (error) {
        console.error('Error saving data to file:', error);
    }
}
export { fetchAllCoins };
// Call the function to start fetching coins
fetchAllCoins()
    .then(() => console.log('Finished fetching all coins.'))
    .catch(err => console.error('Error occurred during fetching:', err));