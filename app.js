import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import pricesRoutes from './routes/pricesRoutes.js'; // Correct import

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the 'public' directory (one level up)
app.use(express.static(path.join(process.cwd(), 'public'))); // Correctly serves public folder

// Use the pricesRoutes for a specific route (e.g., /prices)
app.use('/prices', pricesRoutes); // Matches your fetch call

// Serve the main page at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'prices.html')); // Correct path to prices.html
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
