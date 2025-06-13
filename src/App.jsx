import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import YouTubeProfile from './pages/YouTubeProfile'
import RedditProfile from './pages/RedditProfile'
import TwitterProfile from './pages/TwitterProfile'
import GitHubProfile from './pages/GitHubProfile'
import LinkedInProfile from './pages/LinkedInProfile'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/youtube" element={<YouTubeProfile />} />
          <Route path="/reddit" element={<RedditProfile />} />
          <Route path="/twitter" element={<TwitterProfile />} />
          <Route path="/github" element={<GitHubProfile />} />
          <Route path="/linkedin" element={<LinkedInProfile />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App