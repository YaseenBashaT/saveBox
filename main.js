const express = require('express');
const path = require('path');
require('dotenv').config();  // Load environment variables

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Include YouTube OAuth setup
require('./authSetupYouTube')(app);  // YouTube setup file should export a function and be initialized here

// Route to display a landing page with buttons for YouTube and LinkedIn OAuth
app.get('/', (req, res) => {
  res.render('index');  // Render the index.ejs file with buttons for YouTube and LinkedIn login
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
