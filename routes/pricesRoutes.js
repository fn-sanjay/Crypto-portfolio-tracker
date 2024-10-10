import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Define the route to get prices data
router.get('/prices.json', (req, res) => {
    const filePath = path.join(process.cwd(), 'cache/prices.json');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read prices data.' });
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseError) {
            return res.status(500).json({ error: 'Failed to parse prices data.' });
        }
    });
});

export default router;
