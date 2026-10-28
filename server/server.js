const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./config/db');
const { seedData } = require('./seed/seedData');

// Load env vars
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const statsRoutes = require('./routes/statsRoutes');
const goalRoutes = require('./routes/goalRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const aiAdvisorRoutes = require('./routes/aiAdvisorRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ai', aiAdvisorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: global.isMongoConnected ? 'MongoDB' : 'Local File Store',
    timestamp: new Date().toISOString(),
    service: 'Personal Expense Manager API',
  });
});

// Serve frontend in production if built
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

// Global 404 handler for unmatched API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start Server
connectDB().then(async () => {
  if (global.isMongoConnected) {
    try {
      await seedData();
    } catch (seedErr) {
      console.warn('Seed data skipped or failed:', seedErr.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Expense Manager API running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💾 Database: ${global.isMongoConnected ? 'MongoDB' : 'Local Fast JSON Engine'}`);
    console.log(`💡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
  });
});
