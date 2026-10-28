const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { LocalUser } = require('../config/localStore');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please provide a token.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret_expense_manager_jwt_key_2026'
    );

    let user;
    if (global.isMongoConnected) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = await LocalUser.findById(decoded.id);
      if (user) {
        delete user.password;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route (token invalid or expired)',
    });
  }
};

module.exports = { protect };
