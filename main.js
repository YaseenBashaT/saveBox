const express = require('express');
const path = require('path');
require('dotenv').config();  // Load environment variables

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Include YouTube OAuth setup
require('./authSetupYouTube')(app);

// Include LinkedIn OAuth setup
require('./authSetupLinkedIn')(app);  // Keep LinkedIn integration

// Include Reddit OAuth setup
require('./authSetupReddit')(app);  // Add Reddit OAuth setup

// Route to display a landing page with buttons for YouTube, LinkedIn, and Reddit OAuth
app.get('/', (req, res) => {
  res.render('index');  // Render the index.ejs file with buttons for YouTube, LinkedIn, and Reddit login
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
