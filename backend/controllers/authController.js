const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Role handling: Allow 'supplier' registration (with pending verification).
    // Admin can never be registered from public form.
    const isSupplier = role === 'supplier';
    const assignedRole = isSupplier ? 'supplier' : 'customer';

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      isVerified: !isSupplier, // Customers are verified by default; Suppliers need admin verification
      verificationStatus: isSupplier ? 'pending' : 'approved',
    });

    // If registering as a supplier, return pending verification notification without immediate login token
    if (isSupplier) {
      return res.status(201).json({
        success: true,
        pendingVerification: true,
        message: 'Supplier registration submitted successfully! Your account is pending verification by the administrator.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: false,
          verificationStatus: 'pending',
        }
      });
    }

    // For customers, return active token
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
        verificationStatus: 'approved',
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check supplier verification status
    if (user.role === 'supplier') {
      if (user.verificationStatus === 'pending' || user.isVerified === false) {
        return res.status(403).json({
          success: false,
          isPendingVerification: true,
          message: 'Your supplier account is pending verification by the platform administrator. You will be granted access once approved.'
        });
      }

      if (user.verificationStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          isRejected: true,
          message: 'Your supplier account application was not approved by the administrator.'
        });
      }
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified ?? true,
        verificationStatus: user.verificationStatus ?? 'approved',
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    // Prevent users from escalating their own role or changing password here
    const { role, password, ...safeData } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, safeData, {
      new: true,
      runValidators: true
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
