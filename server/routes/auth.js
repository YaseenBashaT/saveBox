const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ authenticated: !!req.session.user });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;