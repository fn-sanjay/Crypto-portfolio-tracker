import fetch from 'node-fetch';
import fs from 'fs';

const fetchCoinData = async (coinId) => {
    const coinDetailsUrl = `https://api.coingecko.com/api/v3/coins/${coinId}`;
    const marketChartUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30`;

    try {
        const [detailsResponse, chartResponse] = await Promise.all([
            fetch(coinDetailsUrl),
            fetch(marketChartUrl)
        ]);

        const coinDetails = await detailsResponse.json();
        const marketChart = await chartResponse.json();

        const combinedData = {
            details: coinDetails,
            chart: marketChart
        };

        // Save combined data as JSON
        fs.writeFileSync(`${coinId}_data.json`, JSON.stringify(combinedData, null, 2));
        console.log(`Data saved to ${coinId}_data.json`);
    } catch (error) {
        console.error('Error fetching coin data:', error);
    }
};

// Usage
fetchCoinData('tron');


