const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register User
exports.register = async (req, res) => {
  const { name, phone, email, password } = req.body;
  const profilePhoto = req.file ? req.file.path : null;

  try {
    const normalizedPhone = phone.startsWith('0') ? '+254' + phone.slice(1) : phone;
    let user = await User.findOne({ phone: normalizedPhone });
    if (user) {
      return res.status(400).json({ msg: 'User already exists with this phone number' });
    }

    // Security Restriction: Only @gmail.com allowed
    if (!email || !email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ msg: 'Security Restriction: Only @gmail.com email addresses are allowed' });
    }

    user = new User({
      name,
      phone: normalizedPhone,
      email,
      password,
      profilePhoto
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            role: user.role, 
            profilePhoto: user.profilePhoto 
          } 
        });
      }
    );
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ msg: 'Server error during registration', error: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  // Dynamically reload .env to get any fresh changes without needing a restart
  require('dotenv').config({ override: true });

  const { phone, password } = req.body;

  // Normalize phone for lookup
  const normalizedPhone = phone.startsWith('0') ? '+254' + phone.slice(1) : phone;

  console.log('Login Attempt:', { phone, normalized: normalizedPhone });

  try {
    // Check if this is an admin login matching .env credentials directly
    const envAdminPhone = process.env.ADMIN_PHONE;
    const envAdminEmail = process.env.ADMIN_EMAIL;
    const envAdminPassword = process.env.ADMIN_PASSWORD;

    const matchesEnvPhoneOrEmail = 
        (phone === envAdminPhone) || 
        (normalizedPhone === envAdminPhone) || 
        (phone === envAdminEmail);

    const isAdminOverride = matchesEnvPhoneOrEmail && (password === envAdminPassword);

    let user;

    if (isAdminOverride) {
      // Find the admin user to use their DB ID
      user = await User.findOne({ role: 'admin' });
      if (!user) {
        return res.status(400).json({ msg: 'Admin user missing from database' });
      }
      
      // Update the DB to reflect these exact new credentials so the DB isn't stale
      let modified = false;
      if (user.email !== envAdminEmail) { user.email = envAdminEmail; modified = true; }
      if (user.phone !== envAdminPhone) { user.phone = envAdminPhone; modified = true; }
      
      user.password = envAdminPassword; 
      await user.save();
      console.log('Admin Override Login Successful.');
    } else {
      user = await User.findOne({
        $or: [
          { phone: normalizedPhone },
          { email: phone }
        ]
      });
      
      if (!user) {
        console.log('Login Failed: User not found');
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      // Force admin to exclusively use the latest .env credentials
      if (user.role === 'admin') {
         return res.status(400).json({ msg: 'Invalid Admin Credentials' });
      }

      // Security Restriction: Only @gmail.com allowed
      if (user.email && !user.email.toLowerCase().endsWith('@gmail.com')) {
        return res.status(403).json({ msg: 'Security Restriction: Only @gmail.com accounts are permitted to log in' });
      }

      console.log('User found:', user.email);
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        
        const userData = {
          id: user.id,
          name: user.name,
          role: user.role,
          profilePhoto: user.profilePhoto,
          disabled: user.disabled,
          purchasedItems: user.disabled ? [] : user.purchasedItems
        };

        res.json({ token, user: userData });
      }
    );
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const userData = user.toObject();
    // Ensure 'disabled' field is present
    userData.disabled = !!userData.disabled;
    
    if (userData.disabled) {
      userData.purchasedItems = [];
    }

    res.json(userData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (name)  user.name  = name;
    if (email) {
      if (!email.toLowerCase().endsWith('@gmail.com')) {
        return res.status(400).json({ msg: 'Security Restriction: Only @gmail.com email addresses are allowed' });
      }
      user.email = email;
    }
    if (password) user.password = password; // pre-save hook hashes it
    await user.save();
    const updated = await User.findById(req.user.id).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Upload profile photo
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    const user = await User.findById(req.user.id);
    user.profilePhoto = req.file.path; // req.file.path is the Cloudinary URL
    await user.save();
    res.json({ url: req.file.path });
  } catch (err) {
    console.error('=== Photo Upload ERROR ===');
    console.error('Message:', err.message);
    console.error('Error Object:', JSON.stringify(err, null, 2));
    console.error('==========================');
    res.status(500).json({ 
      msg: 'Server error during photo upload', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    await user.deleteOne();
    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete Account Error:', err);
    res.status(500).json({ msg: 'Server error while deleting account' });
  }
};
