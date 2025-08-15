import db from '../lib/db.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { generateToken, generateRefreshToken } from '../lib/utils.js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Promisified database query
const dbQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(Array.isArray(results) ? results : []);
    });
  });
};

// Utility function for sending emails
const sendVerificationEmail = async (email, code) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 5 minutes.</p>
      `,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
};

export const register = async (req, res) => {
  const { username, email, password, isAdmin } = req.body;
  
  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'All fields are required' 
    });
  }

  try {
    // Check for existing user
    const [existingEmail] = await dbQuery('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    const [existingUsername] = await dbQuery('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsername) {
      return res.status(409).json({ 
        success: false,
        message: 'Username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await argon2.hash(password);
    
    // Create user
    const result = await dbQuery(
      'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, isAdmin ? 1 : 0]
    );

    if (result.affectedRows === 0) {
      throw new Error('Registration failed - no rows affected');
    }

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Find user with case-sensitive comparison
    const [user] = await dbQuery(
      'SELECT * FROM users WHERE email = ? AND username = ?',
      [email, username]
    );

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate and store 2FA code
    const code = crypto.randomInt(100000, 999999).toString();
    await dbQuery(
      'UPDATE users SET twoFACode = ?, twoFACodeExpires = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = ?',
      [code, user.id]
    );

    // Send verification email
    await sendVerificationEmail(email, code);

    res.json({ 
      success: true,
      message: 'Verification code sent', 
      status: true,
      userId: user.id 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const verify2FA = async (req, res) => {
  const { username, email, password, code } = req.body;

  try {
    // Verify credentials again
    const [user] = await dbQuery(
      'SELECT * FROM users WHERE email = ? AND username = ?',
      [email, username]
    );

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Verify 2FA code
    if (!user.twoFACode || user.twoFACode !== code) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid verification code' 
      });
    }

    if (new Date() > new Date(user.twoFACodeExpires)) {
      return res.status(401).json({ 
        success: false,
        message: 'Verification code has expired' 
      });
    }

    // Clear 2FA code
    await dbQuery(
      'UPDATE users SET twoFACode = NULL, twoFACodeExpires = NULL WHERE id = ?',
      [user.id]
    );

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set secure cookies
    res.cookie('refreshToken', refreshToken, { 
      httpOnly: true,
      sameSite:  'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      path: '/'
    });

    res.cookie('jwt', accessToken, { 
    httpOnly: true,
    sameSite:  'lax',
    maxAge: 60 * 60 * 1000 // 1 hour
  });

    res.json({ 
      success: true,
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });
  res.status(200).json({ 
    success: true,
    message: 'Logged out successfully' 
  });
};

export const checkAuth = async (req, res) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      user: null // Explicit null
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await dbQuery(
      'SELECT id, username, email, is_admin FROM users WHERE id = ?',
      [decoded.userId]
    );

    res.json({ 
      success: true,
      user: user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      } : null
    });
  } catch (error) {
    res.status(403).json({ 
      success: false,
      user: null
    });
  }
};
// Update the updateProfile function to handle password changes
export const updateProfile = async (req, res) => {
  const { username, email, password, isAdmin } = req.body;
  const userId = req.params.id || req.user.id;

  // Authorization check
  if (userId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ 
      success: false,
      message: 'You can only edit your own profile' 
    });
  }

  try {
    const [user] = await dbQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Prepare update data
    const updateData = {
      username,
      email,
      is_admin: req.user.isAdmin ? (isAdmin ? 1 : 0) : user.is_admin
    };

    // Handle password update if provided
    if (password) {
      updateData.password = await argon2.hash(password);
    }

    await dbQuery(
      'UPDATE users SET ? WHERE id = ?',
      [updateData, userId]
    );

    const [updatedUser] = await dbQuery(
      'SELECT id, username, email, is_admin FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        isAdmin: updatedUser.is_admin
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Profile update failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const listAdmins = async (req, res) => {
  try {
    const results = await dbQuery(
      'SELECT id, username, email, is_admin FROM users'
    );

    res.json({
      success: true,
      admins: results.map(admin => ({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        isAdmin: admin.is_admin
      }))
    });

  } catch (error) {
    console.error('List admins error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch admins',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  // Authorization check
  if (!req.user.isAdmin) {
    return res.status(403).json({ 
      success: false,
      message: 'Admin privileges required' 
    });
  }

  if (parseInt(id) === currentUserId) {
    return res.status(400).json({ 
      success: false,
      message: 'Cannot delete your own account' 
    });
  }

  try {
    const [result] = await dbQuery('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
