const User = require('../models/User');
require('../models/Resume'); // Ensure Resume model is registered with Mongoose for populate
const generateToken = require('../utils/generateToken');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../validators/authValidator');

/**
 * @desc    Register a new user (Candidate or Admin)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { isValid, errors } = validateRegisterInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: errors.join('. '),
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: 'A user with this email address already exists',
      });
    }

    // Create user in DB (password gets hashed automatically by Mongoose pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: errors.join('. '),
      });
    }

    const { email, password } = req.body;

    // Must explicitly select password because select: false is set on the schema
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid email or password credentials',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        resumeId: user.resumeId,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private (Candidate/Admin)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('resumeId');

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
