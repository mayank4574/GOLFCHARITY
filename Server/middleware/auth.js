const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// Verify JWT and attach user to request
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorised — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate('selectedCharity', 'name imageUrl');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Admin-only middleware (must come after protect)
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check active subscription (must come after protect)
const requireSubscription = async (req, res, next) => {
  const sub = await Subscription.findOne({
    userId: req.user._id,
    status: 'active',
  });

  if (!sub) {
    return res.status(403).json({
      message: 'Active subscription required',
      code: 'SUBSCRIPTION_REQUIRED',
    });
  }

  req.subscription = sub;
  next();
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

module.exports = { protect, adminOnly, requireSubscription, signToken };
