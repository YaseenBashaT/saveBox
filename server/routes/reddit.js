const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Get Reddit posts
router.get('/posts', async (req, res) => {
  try {
    if (!req.session.redditTokens) {
      return res.status(401).json({ error: 'Not authenticated with Reddit' });
    }

    const accessToken = req.session.redditTokens.access_token;
    const username = await fetchRedditUsername(accessToken);
    
    const savedPosts = await fetchUserSavedPosts(accessToken, username);
    const upvotedPosts = await fetchUserUpvotedPosts(accessToken, username);

    res.json({ saved: savedPosts, upvoted: upvotedPosts });
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

async function fetchRedditUsername(accessToken) {
  const response = await fetch('https://oauth.reddit.com/api/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'SaveBoxApp/0.1 by YourRedditUsername'
    }
  });

  const data = await response.json();
  return data.name;
}

async function fetchUserSavedPosts(accessToken, username) {
  const response = await fetch(`https://oauth.reddit.com/user/${username}/saved`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'SaveBoxApp/0.1 by YourRedditUsername'
    }
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.data ? data.data.children.map(post => post.data) : [];
}

async function fetchUserUpvotedPosts(accessToken, username) {
  const response = await fetch(`https://oauth.reddit.com/user/${username}/upvoted`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'SaveBoxApp/0.1 by YourRedditUsername'
    }
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.data ? data.data.children.map(post => post.data) : [];
}

module.exports = router;