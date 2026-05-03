const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const ALLOWED_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com'];
const validateEmail = (email) => {
  if (!email) return true;
  const domain = email.toLowerCase().split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
};

const normalizePhone = (p) => {
  if (!p) return p;
  let cleaned = p.trim();
  if (!cleaned.includes('@')) {
    cleaned = cleaned.replace(/\s+/g, '');
    if (cleaned.startsWith('0')) return '+254' + cleaned.slice(1);
    if (cleaned.startsWith('254')) return '+' + cleaned;
    if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) return '+254' + cleaned;
  }
  return cleaned;
};

// Register User
exports.register = async (req, res) => {
  let { name, phone, email, password } = req.body;
  const profilePhoto = req.file ? req.file.path : null;

  try {
    // Normalize inputs
    if (email) email = email.trim() || undefined;
    if (phone) phone = phone.trim() || undefined;

    // Require at least phone or email
    if (!phone && !email) {
      return res.status(400).json({ msg: 'Please provide a phone number or email address to register' });
    }

    // Validate email domain if provided
    if (email && !validateEmail(email)) {
      return res.status(400).json({ msg: `Only Gmail, Yahoo, and Hotmail addresses are allowed` });
    }

    const normalizedPhone = phone ? normalizePhone(phone) : undefined;

    // Check for existing account by phone
    if (normalizedPhone) {
      const existsByPhone = await User.findOne({ phone: normalizedPhone });
      if (existsByPhone) {
        return res.status(400).json({ msg: 'An account already exists with this phone number' });
      }
    }

    // Check for existing account by email
    if (email) {
      const existsByEmail = await User.findOne({ email });
      if (existsByEmail) {
        return res.status(400).json({ msg: 'An account already exists with this email address' });
      }
    }

    const user = new User({
      name,
      phone: normalizedPhone,
      email,
      password,
      profilePhoto
    });

    await user.save();

    // Mark as conversion if sessionId exists
    if (req.body.sessionId) {
      try {
        const Traffic = require('../models/Traffic');
        await Traffic.updateMany({ sessionId: req.body.sessionId }, { isConversion: true });
      } catch (trackErr) {
        console.error('Error updating conversion:', trackErr);
      }
    }

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: { id: user.id, name: user.name, role: user.role, profilePhoto: user.profilePhoto }
      });
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ msg: 'Server error during registration', error: err.message });

  }
};

// Login User
exports.login = async (req, res) => {
  // Dynamically reload .env to get any fresh changes without needing a restart
  require('dotenv').config({ override: true });

  let { phone, password } = req.body;
  if (phone) phone = phone.trim();

  // Normalize phone for lookup
  const normalizedPhone = normalizePhone(phone);

  console.log('Login Attempt:', { phone, normalized: normalizedPhone });

  try {
    // Check if this is an admin login matching .env credentials directly
    const envAdminPhone = process.env.ADMIN_PHONE;
    const envAdminEmail = process.env.ADMIN_EMAIL;
    const envAdminPassword = process.env.ADMIN_PASSWORD;

    const normalizedEnvPhone = normalizePhone(envAdminPhone);

    const matchesEnvPhoneOrEmail = 
        (phone === envAdminPhone) || 
        (normalizedPhone === normalizedEnvPhone) || 
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
      let query;
      const cleanPhoneInput = phone ? phone.trim() : '';
      
      if (cleanPhoneInput.includes('@')) {
        // It's an email
        query = { email: cleanPhoneInput };
      } else {
        // It's a phone number
        const rawNormalizedPhone = cleanPhoneInput.startsWith('0') ? '+254' + cleanPhoneInput.slice(1) : cleanPhoneInput;
        query = {
          $or: [
            { phone: normalizedPhone },
            { phone: rawNormalizedPhone },
            { phone: cleanPhoneInput }
          ]
        };
      }

      user = await User.findOne(query);
      
      if (!user) {
        console.log('Login Failed: User not found');
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      // Force admin to exclusively use the latest .env credentials
      if (user.role === 'admin') {
         return res.status(400).json({ msg: 'Invalid Admin Credentials' });
      }

      // Security Restriction: Only specific domains allowed
      if (user.email && !validateEmail(user.email)) {
        return res.status(403).json({ msg: `Security Restriction: Only ${ALLOWED_DOMAINS.join(', ')} accounts are permitted to log in` });
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
      if (!validateEmail(email)) {
        return res.status(400).json({ msg: `Security Restriction: Only ${ALLOWED_DOMAINS.join(', ')} email addresses are allowed` });
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
