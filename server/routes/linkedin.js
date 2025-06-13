const express = require('express');
const router = express.Router();

// Get LinkedIn profile and posts
router.get('/profile', async (req, res) => {
  try {
    if (!req.session.linkedinProfile || !req.session.linkedinPosts) {
      return res.status(401).json({ error: 'Not authenticated with LinkedIn' });
    }

    res.json({ 
      profile: req.session.linkedinProfile, 
      posts: req.session.linkedinPosts 
    });
  } catch (error) {
    console.error('Error fetching LinkedIn data:', error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn data' });
  }
});

module.exports = router;