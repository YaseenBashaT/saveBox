const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/github', require('./routes/github'));
app.use('/api/reddit', require('./routes/reddit'));
app.use('/api/twitter', require('./routes/twitter'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/linkedin', require('./routes/linkedin'));

app.get('/', (req, res) => {
  res.json({ message: 'Social Media Aggregator API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});