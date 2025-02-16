const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    const userId = await User.create(username, password, email);
    
    // Generate token
    const token = jwt.sign({ id: userId, username }, process.env.JWT_SECRET);
    
    res.status(201).json({ token, username });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValid = await User.validatePassword(user, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET);
    
    res.json({ token, username });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

module.exports = router; 