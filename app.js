import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import pricesRoutes from './routes/pricesRoutes.js';
import detailsRoutes from './routes/detailsRoutes.js'; // Adjust if needed
import { fetchAllCoins } from './controllers/pricesController.mjs'; // Import fetchAllCoins
import authRoutes from "./routes/authRoutes.js";

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Use the routes for specific paths
app.use('/prices', pricesRoutes); // Matches your fetch call for prices
app.use('/details', detailsRoutes); // Matches your fetch call for details
app.use("/auth", authRoutes);

// Serve the main page at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'auth.html'));
});

// Start fetching coins in the background
fetchAllCoins();

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
