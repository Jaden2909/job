const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes from unauthorized visitors
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_123');
      req.user = await User.findById(decoded.id);
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no validation token provided' });
  }
};

// Middleware to restrict access based on user role assignments
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
