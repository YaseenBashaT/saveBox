const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();  // Load environment variables

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Enable sessions
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Include YouTube OAuth setup
require('./authSetupYouTube')(app);
require('./authSetupReddit')(app);  // Ensure this is correct
// Other routes and OAuth setups...

app.get('/', (req, res) => {
  res.render('index');  // Render the index.ejs file with buttons for YouTube
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});