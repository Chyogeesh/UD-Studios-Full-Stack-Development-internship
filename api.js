const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const router = express.Router();
const Search = require('../models/Search');

// Middleware to ensure user is logged in
const ensureAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // Respond with 401 Unauthorized if not logged in
    res.status(401).json({ message: 'Authentication required.' });
};

// --- GET /api/top-searches ---
router.get('/top-searches', async (req, res) => {
    try {
        // MongoDB Aggregation Pipeline to find top 5 search terms
        const topSearches = await Search.aggregate([
            { $group: { 
                _id: '$term', 
                count: { $sum: 1 } 
            }},
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { term: '$_id', count: 1, _id: 0 } }
        ]);

        res.json(topSearches);
    } catch (err) {
        console.error('Error fetching top searches:', err);
        res.status(500).json({ message: 'Server error fetching top searches' });
    }
});

// --- POST /api/search ---
router.post('/search', ensureAuth, async (req, res) => {
    const { term } = req.body;
    if (!term) {
        return res.status(400).json({ message: 'Search term is required.' });
    }

    try {
        // 1. Log the search history
        await Search.create({ 
            userId: req.user._id, 
            term: term 
        });

        // 2. Call Unsplash API
        const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=20`; // Limit to 20 for grid

        const unsplashResponse = await axios.get(unsplashUrl, {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            }
        });

        // 3. Return a clean array of results
        const images = unsplashResponse.data.results.map(img => ({
            id: img.id,
            description: img.alt_description,
            thumbnail: img.urls.thumb,
            regular: img.urls.regular,
        }));

        res.json({
            term: term,
            totalResults: unsplashResponse.data.total,
            images: images,
        });

    } catch (err) {
        console.error('Error performing search or logging history:', err);
        res.status(500).json({ message: 'Server error during search.' });
    }
});


// --- GET /api/history ---
router.get('/history', ensureAuth, async (req, res) => {
    try {
        // Find the current user's search history, sort by most recent, and limit to unique terms
        const history = await Search.find({ userId: req.user._id })
            .select('term timestamp -_id') // Select only the required fields
            .sort({ timestamp: -1 })
            .limit(15); // Show latest 15 searches

        res.json(history);
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ message: 'Server error fetching history' });
    }
});

module.exports = router;
