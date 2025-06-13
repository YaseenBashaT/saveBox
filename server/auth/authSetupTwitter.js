const fetch = require('node-fetch');
const crypto = require('crypto');
require('dotenv').config();

module.exports = function(router) {
  const CLIENT_ID = process.env.TWITTER_CLIENT_ID;
  const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
  const REDIRECT_URI = process.env.TWITTER_REDIRECT_URI || 'http://localhost:3001/auth/twitter/callback';

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
  router.get('/twitter', (req, res) => {
    const { codeVerifier: verifier, codeChallenge: challenge } = generateCodeVerifierAndChallenge();
    codeVerifier = verifier;
    codeChallenge = challenge;

    const authorizationUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=tweet.read%20users.read%20offline.access%20like.read&state=random_state_string&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    
    res.redirect(authorizationUrl);
  });

  // Step 2: Callback to handle Twitter's response and exchange code for tokens
  router.get('/twitter/callback', async (req, res) => {
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

      if (tokenData.error) {
        throw new Error(tokenData.error_description);
      }

      req.session.twitterTokens = tokenData;

      // Redirect to React app
      res.redirect('http://localhost:5173/twitter');
    } catch (error) {
      console.error('Error during Twitter OAuth process:', error);
      res.status(500).send('Error during Twitter OAuth process');
    }
  });
};