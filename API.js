const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 6969;

app.use(cors());
app.use(express.json());

let userCollections = [
  {
    userId: 1,
    itemId: "101",
    mediaType: "anime",
    source: "anilist",
    status: "watching",
    progress: 12
  },
  {
    userId: 1,
    itemId: "205",
    mediaType: "anime",
    source: "mal",
    status: "completed",
    progress: 24
  }
];

function getUserCollection(userId) {
  return userCollections.filter(i => i.userId === userId);
}

function addItemToCollection(data) {
  const {
    userId,
    itemId,
    mediaType,
    source = "unknown",
    status = "planned"
  } = data;

  if (!userId || !itemId || !mediaType) {
    throw new Error("userId, itemId, and mediaType are required");
  }

  const newItem = {
    userId,
    itemId,
    mediaType,
    source,
    status,
    progress: 0
  };

  userCollections.push(newItem);
  return newItem;
}

function updateProgress({ userId, itemId, mediaType, progress }) {
  const item = userCollections.find(
    i =>
      i.userId === userId &&
      i.itemId === itemId &&
      i.mediaType === mediaType
  );

  if (!item) return null;

  item.progress = progress;
  return item;
}

function removeItem({ userId, itemId, mediaType }) {
  const initialLength = userCollections.length;

  userCollections = userCollections.filter(
    i =>
      !(
        i.userId === userId &&
        i.itemId === itemId &&
        i.mediaType === mediaType
      )
  );

  return userCollections.length !== initialLength;
}

app.get('/collection/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const data = getUserCollection(userId);
  res.json(data);
});

app.post('/collection/add', (req, res) => {
  try {
    const newItem = addItemToCollection(req.body);
    res.status(201).json({
      message: "Item added to collection",
      data: newItem
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/collection/update', (req, res) => {
  const updated = updateProgress(req.body);

  if (!updated) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json({
    message: "Progress updated",
    data: updated
  });
});

app.delete('/collection/remove', (req, res) => {
  const removed = removeItem(req.body);

  if (!removed) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json({ message: "Item removed" });
});

app.get('/health', (_, res) => {
  res.json({
    service: "collection-service",
    status: "healthy",
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Collection Service running on http://localhost:${PORT}`);
});
