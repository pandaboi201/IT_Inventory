const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

// Protect routes - verify JWT token
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    db.get('SELECT id, username, email, full_name, role, department FROM users WHERE id = ? AND is_active = 1', 
      [decoded.id], 
      (err, user) => {
        if (err || !user) {
          return res.status(401).json({ error: 'Not authorized to access this route' });
        }
        req.user = user;
        next();
      }
    );
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
