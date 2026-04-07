const mongoose = require('mongoose');
require('dotenv').config({ override: true });
const User = require('./models/User');

async function checkDB() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');
    
    const count = await User.countDocuments();
    console.log('Total Users:', count);
    
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('Admin found:', admin.email, 'Role:', admin.role);
    } else {
      console.log('No Admin found.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDB();
