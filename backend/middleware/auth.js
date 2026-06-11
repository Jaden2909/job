const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify if a user is logged in
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the raw token string from the "Bearer <token>" structure
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_123');

      // Fetch user data from database without returning the password field
      req.user = await User.findById(decoded.id).select('-password');
      
      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ success: false, error: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token payload provided' });
  }
};

// Middleware to restrict access based on specific account roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `User role '${req.user?.role || 'Guest'}' is not authorized to access this action` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
