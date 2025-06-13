const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// Get YouTube videos
router.get('/videos', async (req, res) => {
  try {
    if (!req.session.youtubeTokens) {
      return res.status(401).json({ error: 'Not authenticated with YouTube' });
    }

    const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
    const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/auth/youtube/callback';

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oauth2Client.setCredentials(req.session.youtubeTokens);

    const allVideos = await fetchAllVideos(oauth2Client);
    res.json({ videos: allVideos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Search YouTube videos
router.get('/search', async (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    
    if (!req.session.youtubeTokens) {
      return res.status(401).json({ error: 'Not authenticated with YouTube' });
    }

    const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
    const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/auth/youtube/callback';

    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oauth2Client.setCredentials(req.session.youtubeTokens);

    const allVideos = await fetchAllVideos(oauth2Client);
    
    const filteredVideos = allVideos.filter((video) => {
      const title = video.snippet.title.toLowerCase();
      const description = video.snippet.description.toLowerCase();
      return title.includes(searchQuery.toLowerCase()) || description.includes(searchQuery.toLowerCase());
    });

    res.json({ videos: filteredVideos, searchQuery });
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});

async function fetchAllVideos(auth) {
  const youtube = google.youtube('v3');
  let allVideos = [];

  try {
    // Fetch Liked Videos (LL)
    const likedVideosResponse = await youtube.playlistItems.list({
      part: 'snippet',
      playlistId: 'LL',
      maxResults: 50,
      auth: auth,
    });
    allVideos = allVideos.concat(likedVideosResponse.data.items);

    // Fetch Watch Later Videos (WL)
    const watchLaterResponse = await youtube.playlistItems.list({
      part: 'snippet',
      playlistId: 'WL',
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

    const playlistVideos = await Promise.all(playlistVideoPromises);
    playlistVideos.forEach((videos) => (allVideos = allVideos.concat(videos)));
  } catch (error) {
    console.error('Error fetching videos:', error.response ? error.response.data : error.message);
  }

  return allVideos;
}

module.exports = router;