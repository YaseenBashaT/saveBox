const express = require('express');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'some_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// API Routes
app.use('/auth', require('./routes/auth'));
app.use('/youtube', require('./routes/youtube'));
app.use('/reddit', require('./routes/reddit'));
app.use('/twitter', require('./routes/twitter'));
app.use('/github', require('./routes/github'));
app.use('/linkedin', require('./routes/linkedin'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
});