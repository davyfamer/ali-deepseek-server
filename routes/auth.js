const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    console.log('Register attempt:', { username, email }); // 不记录密码
    
    // 参数验证
    if (!username || !password) {
      console.log('Registration failed: Missing required fields');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      console.log('Registration failed: Username already exists:', username);
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    try {
      const userId = await User.create(username, password, email);
      console.log('User created successfully:', { userId, username });
      
      // Generate token
      const token = jwt.sign({ id: userId, username }, process.env.JWT_SECRET);
      
      res.status(201).json({ token, username });
    } catch (dbError) {
      console.error('Database error during user creation:', dbError);
      throw dbError; // 让外层 catch 处理
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Error creating user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username }); // 不记录密码
    
    // 参数验证
    if (!username || !password) {
      console.log('Login failed: Missing required fields');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await User.findByUsername(username);
    if (!user) {
      console.log('Login failed: User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValid = await User.validatePassword(user, password);
    if (!isValid) {
      console.log('Login failed: Invalid password for user:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET);
    console.log('Login successful:', { userId: user.id, username });
    
    res.json({ token, username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Error logging in',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 