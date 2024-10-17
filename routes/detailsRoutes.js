import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Define the route to get bitcoin data
router.get('/bitcoin_data.json', (req, res) => {
    const filePath = path.join(process.cwd(), 'cache', 'bitcoin_data.json'); // Ensure correct path

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read tron data.' });
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseError) {
            return res.status(500).json({ error: 'Failed to parse tron data.' });
        }
    });
});

export default router;
