const fetch = require('node-fetch');
const session = require('express-session'); // Import session middleware
require('dotenv').config();  // Load environment variables

module.exports = function(app) {
  const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
  const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDDIT_REDIRECT_URI || 'http://localhost:3000/reddit/callback';

  // Add session middleware to store Reddit tokens
  app.use(session({
    secret: 'your-secret-key',  // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // 'false' for local dev, change to 'true' for production if using https
  }));

  // Step 1: Redirect to Reddit's OAuth authorization URL
  app.get('/auth/reddit', (req, res) => {
    const authorizationUrl = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID}&response_type=code&state=random_string&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&duration=temporary&scope=identity history`;
    console.log('Reddit Auth URL:', authorizationUrl);
    res.redirect(authorizationUrl);
  });

  // Step 2: Callback to handle Reddit's response
  app.get('/reddit/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send('No authorization code provided');
    }

    try {
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
      });

      const tokenData = await tokenResponse.json();
      console.log('Reddit Token Data:', tokenData);

      if (tokenData.error) {
        throw new Error(tokenData.error);
      }

      const accessToken = tokenData.access_token;

      // Store tokens in the session
      req.session.redditTokens = tokenData;

      // Fetch the Reddit username
      const username = await fetchRedditUsername(accessToken);
      console.log('Reddit Username:', username);

      // Fetch saved and upvoted posts
      const savedPosts = await fetchUserSavedPosts(accessToken, username);
      const upvotedPosts = await fetchUserUpvotedPosts(accessToken, username);

      // Render the saved and upvoted posts in a view
      res.render('redditProfile', { saved: savedPosts, upvoted: upvotedPosts });

    } catch (error) {
      console.error('Error during Reddit OAuth process:', error);
      res.status(500).send('Error during Reddit OAuth process');
    }
  });

  // Middleware to check for stored tokens and use them if available
  app.use((req, res, next) => {
    if (req.session.redditTokens) {
      req.redditAccessToken = req.session.redditTokens.access_token;
    }
    next();
  });

  // Helper function to fetch the Reddit username
  async function fetchRedditUsername(accessToken) {
    const response = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'SaveBoxApp/0.1 by YourRedditUsername'  // Replace with your actual Reddit username
      }
    });
  
    const data = await response.json();
    return data.name;  // Return the Reddit username
  }

  // Helper function to fetch saved posts
  async function fetchUserSavedPosts(accessToken, username) {
    console.log('Fetching saved posts...');
    const response = await fetch(`https://oauth.reddit.com/user/${username}/saved`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'SaveBoxApp/0.1 by YourRedditUsername'  // Replace with your actual Reddit username
      }
    });

    const responseText = await response.text();
    console.log('Saved Posts Response:', responseText);

    if (!response.ok) {
      const error = JSON.parse(responseText);
      console.log('Saved Posts Error:', error);
      return [];
    }

    const data = JSON.parse(responseText);
    return data.data ? data.data.children.map(post => post.data) : [];
  }

  // Helper function to fetch upvoted posts
  async function fetchUserUpvotedPosts(accessToken, username) {
    console.log('Fetching upvoted posts...');
    const response = await fetch(`https://oauth.reddit.com/user/${username}/upvoted`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'SaveBoxApp/0.1 by YourRedditUsername'  // Replace with your actual Reddit username
      }
    });

    const responseText = await response.text();
    console.log('Upvoted Posts Response:', responseText);

    if (!response.ok) {
      const error = JSON.parse(responseText);
      console.log('Upvoted Posts Error:', error);
      return [];
    }

    const data = JSON.parse(responseText);
    return data.data ? data.data.children.map(post => post.data) : [];
  }
};
