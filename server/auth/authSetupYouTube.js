const { google } = require('googleapis');
require('dotenv').config();

module.exports = function(router) {
  const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
  const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/auth/youtube/callback';
  
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error('YouTube OAuth credentials are not set in the environment variables.');
  }

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  // Serve the OAuth route to initiate YouTube authentication
  router.get('/youtube', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.readonly'],
    });
    res.redirect(authUrl);
  });

  // Handle the OAuth callback and fetch videos
  router.get('/youtube/callback', async (req, res) => {
    const code = req.query.code;
    if (code) {
      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        req.session.youtubeTokens = tokens;

        // Redirect to React app
        res.redirect('http://localhost:5173/youtube');
      } catch (error) {
        console.error('Error retrieving tokens:', error);
        res.status(500).send('Error retrieving tokens');
      }
    } else {
      res.status(400).send('No authorization code provided');
    }
  });
};