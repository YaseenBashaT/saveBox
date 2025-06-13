const fetch = require('node-fetch');
require('dotenv').config();

module.exports = function(router) {
  const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
  const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDDIT_REDIRECT_URI || 'http://localhost:3001/auth/reddit/callback';

  // Step 1: Redirect to Reddit's OAuth authorization URL
  router.get('/reddit', (req, res) => {
    const authorizationUrl = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID}&response_type=code&state=random_string&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&duration=temporary&scope=identity history`;
    res.redirect(authorizationUrl);
  });

  // Step 2: Callback to handle Reddit's response
  router.get('/reddit/callback', async (req, res) => {
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

      if (tokenData.error) {
        throw new Error(tokenData.error);
      }

      req.session.redditTokens = tokenData;

      // Redirect to React app
      res.redirect('http://localhost:5173/reddit');

    } catch (error) {
      console.error('Error during Reddit OAuth process:', error);
      res.status(500).send('Error during Reddit OAuth process');
    }
  });
};