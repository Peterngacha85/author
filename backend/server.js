const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ override: true });

const app = express();

// CORS — allowlist of trusted origins
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://www.joetales.co.ke',
  'https://author-azure-eta.vercel.app',
].filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, Accept, Origin, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Middleware
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// DB Connection..
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected...');
    require('./utils/seeder')(); // Seed Admin

    // Rebuild indexes that no longer match the schema (e.g. mpesaCode went from
    // required+unique to optional+sparse — the old non-sparse index has to be dropped).
    require('./models/Transaction').syncIndexes()
      .then(() => console.log('Transaction indexes synced'))
      .catch(err => console.error('Transaction index sync error:', err));
  })
  .catch(err => console.log('MongoDB Connection Error:', err));

// Basic Route
app.get('/', (req, res) => {
  res.send('Author Content Management System API is running...');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/geo', require('./routes/geo'));

// Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(err.status || 500).json({
    msg: err.message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
