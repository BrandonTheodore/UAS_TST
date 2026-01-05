const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 6969;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let users = [
  { userId: 1, username: "theo" },
  { userId: 2, username: "guest" }
];

let userCollections = [
  {
    userId: 1,
    itemId: 101,
    mediaType: "anime",
    source: "anilist",
    status: "watching",
    progress: 12
  },
  {
    userId: 1,
    itemId: 205,
    mediaType: "anime",
    source: "mal",
    status: "completed",
    progress: 24
  }
];

function getUserById(userId) {
  return users.find(u => u.userId === userId);
}

function generateUserId() {
  return users.length
    ? Math.max(...users.map(u => u.userId)) + 1
    : 1;
}

function addUser({ username }) {
  if (!username || typeof username !== "string") {
    throw new Error("username is required");
  }

  const exists = users.some(
    u => u.username.toLowerCase() === username.toLowerCase()
  );

  if (exists) {
    throw new Error("username already exists");
  }

  const newUser = {
    userId: generateUserId(),
    username
  };

  users.push(newUser);
  return newUser;
}

function getUserCollection(userId) {
  const user = getUserById(userId);
  if (!user) return null;

  const items = userCollections
    .filter(i => i.userId === userId)
    .map(({ userId, ...item }) => item);

  return {
    userId: user.userId,
    username: user.username,
    items
  };
}

function addItemToCollection(data) {
  const {
    userId,
    itemId,
    mediaType,
    source = "unknown",
    status = "planned"
  } = data;

  if (!getUserById(userId)) {
    throw new Error("User does not exist");
  }

  if (!Number.isInteger(itemId)) {
    throw new Error("itemId must be an integer");
  }

  if (!userId || !mediaType) {
    throw new Error("userId and mediaType are required");
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

  const { userId: _, ...cleanItem } = newItem;
  return cleanItem;
}

function updateProgress({ userId, itemId, mediaType, progress }) {
  const item = userCollections.find(
    i =>
      i.userId === userId &&
      i.itemId === Number(itemId) &&
      i.mediaType === mediaType
  );

  if (!item) return null;

  item.progress = progress;
  const { userId: _, ...cleanItem } = item;
  return cleanItem;
}

function removeItem({ userId, itemId, mediaType }) {
  const before = userCollections.length;

  userCollections = userCollections.filter(
    i =>
      !(
        i.userId === userId &&
        i.itemId === Number(itemId) &&
        i.mediaType === mediaType
      )
  );

  return userCollections.length !== before;
}

app.post('/users/add', (req, res) => {
  try {
    const user = addUser(req.body);
    res.status(201).json({
      message: "User created",
      data: user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/users', (_, res) => {
  res.json(users);
});

app.get('/collection/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const data = getUserCollection(userId);

  if (!data) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(data);
});

app.post('/collection/add', (req, res) => {
  try {
    const item = addItemToCollection(req.body);
    res.status(201).json({
      message: "Item added",
      data: item
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
