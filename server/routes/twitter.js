const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Get Twitter tweets
router.get('/tweets', async (req, res) => {
  try {
    if (!req.session.twitterTokens) {
      return res.status(401).json({ error: 'Not authenticated with Twitter' });
    }

    const accessToken = req.session.twitterTokens.access_token;
    const userId = await fetchTwitterUserId(accessToken);
    const likedTweets = await fetchLikedTweets(accessToken, userId);

    res.json({ likedTweets });
  } catch (error) {
    console.error('Error fetching Twitter tweets:', error);
    res.status(500).json({ error: 'Failed to fetch tweets' });
  }
});

async function fetchTwitterUserId(accessToken) {
  const response = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'SaveBoxApp/0.1 by YourTwitterUsername'
    }
  });

  const data = await response.json();
  return data.data.id;
}

async function fetchLikedTweets(accessToken, userId) {
  const response = await fetch(`https://api.twitter.com/2/users/${userId}/liked_tweets`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'SaveBoxApp/0.1 by YourTwitterUsername'
    }
  });

  const data = await response.json();
  return data.data ? data.data : [];
}

module.exports = router;