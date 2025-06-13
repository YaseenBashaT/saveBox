const fetch = require('node-fetch');
require('dotenv').config();

module.exports = function(router) {
  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3001/auth/linkedin/callback';
  
  // LinkedIn Authorization Route
  router.get('/linkedin', (req, res) => {
    const authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
    res.redirect(authorizationUrl);
  });

  // Callback Route to Handle LinkedIn's Response
  router.get('/linkedin/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send('No authorization code provided');
    }

    try {
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
      });
      const tokenData = await tokenResponse.json();
      if (tokenData.error) {
        throw new Error(tokenData.error_description);
      }

      const accessToken = tokenData.access_token;

      // Fetch LinkedIn Profile Information
      const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profileData = await profileResponse.json();

      // Fetch LinkedIn Posts
      const postsResponse = await fetch(`https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${profileData.id})`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const postsData = await postsResponse.json();

      // Store in session
      req.session.linkedinProfile = profileData;
      req.session.linkedinPosts = postsData.elements || [];

      // Redirect to React app
      res.redirect('http://localhost:5173/linkedin');

    } catch (error) {
      console.error('Error during LinkedIn OAuth process:', error);
      res.status(500).send('Error during LinkedIn OAuth process');
    }
  });
};