const fetch = require('node-fetch');
const crypto = require('crypto');
require('dotenv').config();  // Load environment variables

module.exports = function(app) {
  const CLIENT_ID = process.env.TWITTER_CLIENT_ID;
  const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
  const REDIRECT_URI = process.env.TWITTER_REDIRECT_URI || 'http://localhost:3000/twitter/callback';

  // Function to generate code_verifier and code_challenge using PKCE
  function generateCodeVerifierAndChallenge() {
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = crypto.createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge };
  }

  let codeVerifier = '';
  let codeChallenge = '';

  // Step 1: Redirect to Twitter's OAuth authorization URL with PKCE
  app.get('/auth/twitter', (req, res) => {
    const { codeVerifier: verifier, codeChallenge: challenge } = generateCodeVerifierAndChallenge();
    codeVerifier = verifier;
    codeChallenge = challenge;

    const authorizationUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=tweet.read%20users.read%20offline.access%20like.read&state=random_state_string&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    
    console.log('Twitter Auth URL:', authorizationUrl);
    res.redirect(authorizationUrl);
  });

  // Step 2: Callback to handle Twitter's response and exchange code for tokens
  app.get('/twitter/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send('No authorization code provided');
    }

    try {
      const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_id=${CLIENT_ID}&code_verifier=${codeVerifier}`
      });

      const tokenData = await tokenResponse.json();
      console.log('Twitter Token Data:', tokenData);

      if (tokenData.error) {
        throw new Error(tokenData.error_description);
      }

      const accessToken = tokenData.access_token;

      // Store tokens in the session
      req.session.twitterTokens = tokenData;

      // Fetch the user's ID
      const userId = await fetchTwitterUserId(accessToken);
      console.log('Twitter User ID:', userId);

      // Fetch liked tweets
      const likedTweets = await fetchLikedTweets(accessToken, userId);
      res.render('twitterProfile', { likedTweets });
    } catch (error) {
      console.error('Error during Twitter OAuth process:', error);
      res.status(500).send('Error during Twitter OAuth process');
    }
  });

  // Helper function to fetch the user's ID
  async function fetchTwitterUserId(accessToken) {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'SaveBoxApp/0.1 by YourTwitterUsername'
      }
    });

    const data = await response.json();
    return data.data.id;  // Return the user's ID
  }

  // Helper function to fetch liked tweets using the user ID
  async function fetchLikedTweets(accessToken, userId) {
    console.log('Fetching liked tweets...');
    const response = await fetch(`https://api.twitter.com/2/users/${userId}/liked_tweets`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'SaveBoxApp/0.1 by YourTwitterUsername'
      }
    });

    const responseText = await response.text();
    console.log('Liked Tweets Response:', responseText); // Log the raw response for debugging

    const data = JSON.parse(responseText);
    return data.data ? data.data : [];
  }
};