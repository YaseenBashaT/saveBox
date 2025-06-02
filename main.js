const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Session middleware (required for storing OAuth tokens or session data)
app.use(session({
  secret: 'some_secret_key', // change this to a strong secret in prod
  resave: false,
  saveUninitialized: true,
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// YouTube OAuth setup
require('./authSetupYouTube')(app);

// Reddit OAuth setup
require('./authSetupReddit')(app);

// Twitter OAuth setup
require('./authSetupTwitter')(app);

// LinkedIn OAuth setup
require('./authSetupLinkedIn')(app);

// GitHub OAuth setup
require('./authSetupGitHub')(app);

// Landing page with buttons (make sure you have index.ejs)
app.get('/', (req, res) => {
  res.render('index');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
