const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  res.json({ message: 'GitHub profile endpoint' });
});

module.exports = router;