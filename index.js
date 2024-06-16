const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.json());

// Simulated in-memory storage
let users = [];
let nextUserId = 1; // Counter for generating unique user IDs

// Helper functions to find user by ID or username
const findUserById = (id) => users.find(user => user._id === id);
const findUserByUsername = (username) => users.find(user => user.username === username);

// Routes

// Create a new user
app.post("/api/users", (req, res) => {
  const { username } = req.body;

  // Check if user already exists
  if (findUserByUsername(username)) {
    return res.json({ error: 'Username already taken' });
  }

  // Create new user
  const newUser = {
    _id: nextUserId.toString(),
    username: username,
    log: [],
    count: 0
  };

  nextUserId++;
  users.push(newUser);

  res.json({ _id: newUser._id, username: newUser.username });
});

// Get all users
app.get("/api/users", (req, res) => {
  const usersToReturn = users.map(user => ({ _id: user._id, username: user.username }));
  res.json(usersToReturn);
});

// Add exercise to a user
app.post("/api/users/:_id/exercises", (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const user = findUserById(userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  const exercise = {
    description: description,
    duration: Number(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  user.log.push(exercise);
  user.count++;

  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

// Get user's exercise log
app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = findUserById(userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  let filteredLog = user.log.slice();

  // Apply filters
  if (from) {
    const fromDate = new Date(from);
    filteredLog = filteredLog.filter(exercise => new Date(exercise.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    filteredLog = filteredLog.filter(exercise => new Date(exercise.date) <= toDate);
  }
  if (limit) {
    filteredLog = filteredLog.slice(0, limit);
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: filteredLog.length,
    log: filteredLog
  });
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
