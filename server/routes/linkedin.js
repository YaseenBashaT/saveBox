const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  res.json({ message: 'LinkedIn profile endpoint' });
});

module.exports = router;