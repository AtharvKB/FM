const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // ✅ ADD THIS
const User = require('../models/User');

// ✅ Helper function to generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email: email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// ========================================
// REGISTER ROUTE
// ========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, securityAnswer } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with user-provided security answer
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      securityQuestion: 'What is your favorite color?',
      securityAnswer: (securityAnswer || 'blue').toLowerCase().trim(),
      isPremium: false,
      transactions: []
    });

    await newUser.save();

    // ✅ GENERATE JWT TOKEN
    const token = generateToken(newUser._id, newUser.email);

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      data: { // ✅ Changed from "user" to "data"
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isPremium: newUser.isPremium,
        token: token // ✅ RETURN TOKEN
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// ========================================
// LOGIN ROUTE
// ========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if premium expired
    let isPremium = user.isPremium;
    if (user.isPremium && user.premiumEndDate && new Date() > user.premiumEndDate) {
      isPremium = false;
      user.isPremium = false;
      await user.save();
    }

    // ✅ GENERATE JWT TOKEN
    const token = generateToken(user._id, user.email);

    res.json({ 
      success: true, 
      message: 'Login successful',
      data: { // ✅ Changed from "user" to "data"
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: isPremium,
        premiumEndDate: user.premiumEndDate,
        token: token // ✅ RETURN TOKEN
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// ========================================
// FORGOT PASSWORD ROUTES
// ========================================

// Step 1: Check email and get security question
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email' 
      });
    }

    // If user doesn't have security question/answer (old users), set default
    if (!user.securityQuestion || !user.securityAnswer) {
      user.securityQuestion = 'What is your favorite color?';
      user.securityAnswer = 'blue';
      await user.save();
    }

    res.json({ 
      success: true, 
      securityQuestion: user.securityQuestion 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Step 2: Verify Security Answer
router.post('/verify-security-answer', async (req, res) => {
  try {
    const { email, answer } = req.body;

    if (!email || !answer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and answer are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Case-insensitive comparison
    const userAnswer = (user.securityAnswer || '').toLowerCase().trim();
    const providedAnswer = (answer || '').toLowerCase().trim();

    if (userAnswer !== providedAnswer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Incorrect answer. Please try again.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Answer verified successfully' 
    });
  } catch (error) {
    console.error('Verify answer error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Step 3: Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
