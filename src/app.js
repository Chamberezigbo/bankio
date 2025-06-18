const express = require('express');
const cors = require("cors");

const userRoutes = require('./routes/userRoutes'); // example route
const transactionRoutes = require('./routes/transactionsRoutes'); 
const adminRoutes = require('./routes/adminRouter'); // admin routes
const errorLogger = require('./middleware/error'); // error logger


const app = express();

app.use(cors()); // Enable CORS for all routes

// Middlewares
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes); // Admin routes

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'I think you hit the wrong endpoint' });
});

// Error handling middleware
app.use(errorLogger);

// Export the configured app
module.exports = app;
