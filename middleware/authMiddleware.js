const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    console.log(req.user)
    console.log(decoded)
    // attach the decoded user info to the request
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const verifyRole = (roles) => (req, res, next) => {
  console.log(roles,req.user.role)
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access forbidden: insufficient rights' });
  }
  next();
};

module.exports = { verifyToken, verifyRole };
