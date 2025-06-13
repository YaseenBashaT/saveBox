import React, { useState, useEffect } from 'react'
import { Search, ExternalLink, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function TwitterProfile() {
  const [likedTweets, setLikedTweets] = useState([])
  const [filteredTweets, setFilteredTweets] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTweets()
  }, [])

  useEffect(() => {
    filterTweets()
  }, [searchQuery, likedTweets])

  const fetchTweets = async () => {
    try {
      const response = await axios.get('/api/twitter/tweets')
      setLikedTweets(response.data.likedTweets || [])
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch Twitter tweets')
      setLoading(false)
    }
  }

  const filterTweets = () => {
    if (!searchQuery.trim()) {
      setFilteredTweets(likedTweets)
      return
    }

    const filtered = likedTweets.filter(tweet => {
      const text = tweet.text?.toLowerCase() || ''
      const query = searchQuery.toLowerCase()
      return text.includes(query)
    })
    setFilteredTweets(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twitter mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your liked tweets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-twitter mb-2">Liked Tweets</h1>
          <p className="text-gray-600">Your liked tweets from Twitter</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tweets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pl-10"
            />
          </div>
        </div>

        {filteredTweets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No tweets found matching your search.' : 'No liked tweets available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTweets.map((tweet, index) => (
              <div key={index} className="card">
                <p className="text-gray-900 mb-4 leading-relaxed">
                  {tweet.text}
                </p>
                <a
                  href={`https://twitter.com/i/web/status/${tweet.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-twitter text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <ExternalLink size={16} className="mr-2" />
                  View on Twitter
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TwitterProfile