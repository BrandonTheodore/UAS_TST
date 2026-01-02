const express = require('express');
const app = express();
const PORT = 6969;

app.use(express.json());

// Mock Database
let userWatchlists = [
    { userId: 1, animeId: 101, status: "watching", progress: 12 },
    { userId: 1, animeId: 205, status: "completed", progress: 24 }
];

// 1. GET: Fetch a specific user's watchlist
app.get('/watchlist/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const list = userWatchlists.filter(item => item.userId === userId);
    res.json(list);
});

// 2. POST: Add a new anime to the watchlist (The Integration Point)
// This is where you'd send the animeId you got from API 1
app.post('/watchlist/add', (req, res) => {
    const { userId, animeId, status } = req.body;
    
    const newItem = {
        userId,
        animeId, // This ID matches the ID from API 1
        status: status || "plan-to-watch",
        progress: 0
    };

    userWatchlists.push(newItem);
    res.status(201).json({ message: "Added to watchlist!", data: newItem });
});

// 3. PATCH: Update watching progress
app.patch('/watchlist/update', (req, res) => {
    const { userId, animeId, progress } = req.body;
    
    const item = userWatchlists.find(i => i.userId === userId && i.animeId === animeId);
    
    if (item) {
        item.progress = progress;
        return res.json({ message: "Progress updated", item });
    }
    
    res.status(404).json({ message: "Anime not found in user's list" });
});

// 4. DELETE: Remove from watchlist
app.delete('/watchlist/remove', (req, res) => {
    const { userId, animeId } = req.body;
    userWatchlists = userWatchlists.filter(i => !(i.userId === userId && i.animeId === animeId));
    res.json({ message: "Removed from watchlist" });
});

app.listen(PORT, () => {
    console.log(`Tracker Service running on http://localhost:${PORT}`);
});