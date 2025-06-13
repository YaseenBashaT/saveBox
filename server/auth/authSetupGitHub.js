const fetch = require('node-fetch');
require('dotenv').config();

module.exports = function(router) {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/auth/github/callback';

  // Redirect user to GitHub for authentication
  router.get('/github', (req, res) => {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=read:user user:email repo`;
    res.redirect(authUrl);
  });

  // GitHub redirects back with code
  router.get('/github/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send('No code received');

    try {
      // Exchange code for access token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI
        })
      });

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // Fetch GitHub profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json'
        }
      });
      const userData = await userRes.json();

      // Fetch user's public repositories
      const reposRes = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json'
        }
      });
      const reposData = await reposRes.json();

      // Store in session
      req.session.githubProfile = userData;
      req.session.githubRepos = reposData;

      // Redirect to React app
      res.redirect('http://localhost:5173/github');

    } catch (error) {
      console.error('GitHub OAuth Error:', error);
      res.status(500).send('OAuth failed');
    }
  });
};