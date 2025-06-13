const express = require('express');
const router = express.Router();

// Get GitHub profile and repos
router.get('/profile', async (req, res) => {
  try {
    if (!req.session.githubProfile || !req.session.githubRepos) {
      return res.status(401).json({ error: 'Not authenticated with GitHub' });
    }

    res.json({ 
      profile: req.session.githubProfile, 
      repos: req.session.githubRepos 
    });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
});

module.exports = router;