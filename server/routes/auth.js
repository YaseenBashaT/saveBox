const express = require('express');
const router = express.Router();

// YouTube OAuth setup
require('../auth/authSetupYouTube')(router);

// Reddit OAuth setup
require('../auth/authSetupReddit')(router);

// Twitter OAuth setup
require('../auth/authSetupTwitter')(router);

// LinkedIn OAuth setup
require('../auth/authSetupLinkedIn')(router);

// GitHub OAuth setup
require('../auth/authSetupGitHub')(router);

module.exports = router;