const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { LocalUser } = require('../config/localStore');

const generateToken = (id) => {
  return jwt.sign(
    { id: id.toString() },
    process.env.JWT_SECRET || 'secret_expense_manager_jwt_key_2026',
    {
      expiresIn: '30d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, currency } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (global.isMongoConnected) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email address',
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        currency: currency || '$',
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          token,
        },
      });
    } else {
      // Local fallback
      const userExists = await LocalUser.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email address',
        });
      }

      const user = await LocalUser.create({
        name,
        email,
        password,
        currency: currency || '$',
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          token,
        },
      });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    let user;
    if (global.isMongoConnected) {
      user = await User.findOne({ email });
    } else {
      user = await LocalUser.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        token,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    let user;
    if (global.isMongoConnected) {
      user = await User.findById(req.user._id).select('-password');
    } else {
      user = await LocalUser.findById(req.user._id);
      if (user) delete user.password;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile & currency
// @route   PUT /api/auth/me
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const { name, currency } = req.body;

    if (global.isMongoConnected) {
      const user = await User.findById(req.user._id);
      if (name) user.name = name;
      if (currency) user.currency = currency;
      await user.save();
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
        },
      });
    } else {
      const user = await LocalUser.findById(req.user._id);
      if (name) user.name = name;
      if (currency) user.currency = currency;
      await user.save();
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
