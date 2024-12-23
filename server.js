// server/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes=require('./routes/auth')
const quizRoutes = require('./routes/quizRoutes'); // Importing quiz routes
const { verifyToken, verifyRole } = require('./middleware/authMiddleware');
const userRoutes = require('./routes/user'); 

const app = express();
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('Welcome to the Online Quiz System API');
});
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes); // Use user routes
 // Quiz routes

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
