import jwt from 'jsonwebtoken';
import db from '../lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

export const protectRoute = async (req, res, next) => {
  try {
    // 1. Get token from cookies or Authorization header
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized - No token provided" 
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const [user] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT id, username, email, is_admin FROM users WHERE id = ?", 
        [decoded.userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized - User no longer exists" 
      });
    }

    // 4. Grant access to protected route
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.is_admin
    };

    next();
  } catch (error) {
    console.error("Protect route error:", error);
    
    // Handle token expiration specifically
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Session expired - Please login again" 
      });
    }
    
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid token",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin-specific middleware
export const restrictToAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Forbidden - Admin privileges required"
    });
  }
  next();
};