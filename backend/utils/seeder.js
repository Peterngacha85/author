const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPhone = process.env.ADMIN_PHONE;

    if (!adminEmail || !adminPassword) {
      console.log('Admin credentials not found in .env, skipping seed.');
      return;
    }

    let admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('Admin user found, syncing credentials...');
      admin.email = adminEmail;
      admin.phone = adminPhone || '0000000000';
      admin.password = adminPassword; // pre-save will hash if changed
      await admin.save();
      console.log('Admin credentials synced successfully.');
      return;
    }

    admin = new User({
      name: 'Admin Joe',
      phone: adminPhone || '0000000000',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user seeded successfully.');
  } catch (err) {
    console.error('Error seeding admin:', err.message);
  }
};

module.exports = seedAdmin;
