const { google } = require('googleapis');
require('dotenv').config();  // Load environment variables

module.exports = function(app) {  // Export YouTube OAuth setup as a function
  const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
  const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
  const REDIRECT_URI =  'http://localhost:3000/oauth2callback';

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
        const allVideos = await fetchAllVideos(oauth2Client);
        res.render('videos', { videos: allVideos });
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
        maxResults: 50,  // Adjust to the desired number
        auth: auth
      });
      allVideos = allVideos.concat(likedVideosResponse.data.items);

      // Fetch Watch Later Videos (WL)
      const watchLaterResponse = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: 'WL',  // Watch Later playlist ID
        maxResults: 50,  // Adjust to the desired number
        auth: auth
      });
      allVideos = allVideos.concat(watchLaterResponse.data.items);

      // Fetch User-Created Playlists
      const userPlaylistsResponse = await youtube.playlists.list({
        part: 'snippet',
        mine: true,  // Fetch user-created playlists
        maxResults: 10,  // Adjust to the desired number of playlists
        auth: auth
      });

      // Fetch videos from each user-created playlist
      const playlistVideoPromises = userPlaylistsResponse.data.items.map(async (playlist) => {
        const playlistVideosResponse = await youtube.playlistItems.list({
          part: 'snippet',
          playlistId: playlist.id,  // Fetch videos from each playlist
          maxResults: 50,  // Adjust to the desired number of videos per playlist
          auth: auth
        });
        return playlistVideosResponse.data.items;
      });

      // Await all playlist video fetches and concatenate them to allVideos
      const playlistVideos = await Promise.all(playlistVideoPromises);
      playlistVideos.forEach(videos => allVideos = allVideos.concat(videos));

    } catch (error) {
      console.error('Error fetching videos:', error.response ? error.response.data : error.message);
    }

    return allVideos;  // Return the combined list of videos
  }
};
