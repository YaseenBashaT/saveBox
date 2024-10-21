const { google } = require('googleapis');
require('dotenv').config();  // Load environment variables

module.exports = function(app) {
  const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
  const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  // Serve the OAuth route to initiate YouTube authentication
  app.get('/auth', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',  // Get a refresh token
      scope: ['https://www.googleapis.com/auth/youtube.readonly'],  // YouTube read-only access
    });
    res.redirect(authUrl);  // Redirect user to Google's OAuth consent screen
  });

  // Handle the OAuth callback and fetch videos
  app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    if (code) {
      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        req.session.youtubeTokens = tokens;  // Store tokens in session

        const allVideos = await fetchAllVideos(oauth2Client);
        res.render('youtubeProfile', { videos: allVideos, searchQuery: '' });
      } catch (error) {
        console.error('Error retrieving tokens or videos:', error);
        res.status(500).send('Error retrieving tokens or videos');
      }
    } else {
      res.status(400).send('No authorization code provided');
    }
  });

  // Function to fetch videos from Liked Videos, Watch Later, and user-created playlists
  async function fetchAllVideos(auth) {
    const youtube = google.youtube('v3');
    let allVideos = [];

    try {
      // Fetch Liked Videos (LL)
      const likedVideosResponse = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: 'LL',  // Liked Videos playlist ID
        maxResults: 50,
        auth: auth,
      });
      allVideos = allVideos.concat(likedVideosResponse.data.items);

      // Fetch Watch Later Videos (WL)
      const watchLaterResponse = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: 'WL',  // Watch Later playlist ID
        maxResults: 50,
        auth: auth,
      });
      allVideos = allVideos.concat(watchLaterResponse.data.items);

      // Fetch User-Created Playlists
      const userPlaylistsResponse = await youtube.playlists.list({
        part: 'snippet',
        mine: true,
        maxResults: 10,
        auth: auth,
      });

      // Fetch videos from each user-created playlist
      const playlistVideoPromises = userPlaylistsResponse.data.items.map(async (playlist) => {
        const playlistVideosResponse = await youtube.playlistItems.list({
          part: 'snippet',
          playlistId: playlist.id,
          maxResults: 50,
          auth: auth,
        });
        return playlistVideosResponse.data.items;
      });

      // Await all playlist video fetches and concatenate them to allVideos
      const playlistVideos = await Promise.all(playlistVideoPromises);
      playlistVideos.forEach((videos) => (allVideos = allVideos.concat(videos)));
    } catch (error) {
      console.error('Error fetching videos:', error.response ? error.response.data : error.message);
    }

    return allVideos;
  }

  // Search functionality: filter videos by title and description
  app.get('/youtube/search', async (req, res) => {
    const searchQuery = req.query.q || '';
    
    // Check if the session has valid tokens
    if (req.session.youtubeTokens) {
      oauth2Client.setCredentials(req.session.youtubeTokens);
    } else {
      return res.redirect('/auth');  // If no tokens, redirect to auth flow
    }

    try {
      const allVideos = await fetchAllVideos(oauth2Client);
      
      // Filter the videos based on the search query in both title and description
      const filteredVideos = allVideos.filter((video) => {
        const title = video.snippet.title.toLowerCase();
        const description = video.snippet.description.toLowerCase();
        return title.includes(searchQuery.toLowerCase()) || description.includes(searchQuery.toLowerCase());
      });

      res.render('youtubeProfile', { videos: filteredVideos, searchQuery });
    } catch (error) {
      console.error('Error during search:', error);
      res.status(500).send('Error during search');
    }
  });
};
