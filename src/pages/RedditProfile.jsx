import React, { useState, useEffect } from 'react'
import { Search, ExternalLink, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function RedditProfile() {
  const [savedPosts, setSavedPosts] = useState([])
  const [upvotedPosts, setUpvotedPosts] = useState([])
  const [filteredSaved, setFilteredSaved] = useState([])
  const [filteredUpvoted, setFilteredUpvoted] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [searchQuery, savedPosts, upvotedPosts])

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/reddit/posts')
      setSavedPosts(response.data.saved || [])
      setUpvotedPosts(response.data.upvoted || [])
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch Reddit posts')
      setLoading(false)
    }
  }

  const filterPosts = () => {
    if (!searchQuery.trim()) {
      setFilteredSaved(savedPosts)
      setFilteredUpvoted(upvotedPosts)
      return
    }

    const query = searchQuery.toLowerCase()
    
    const filteredSavedPosts = savedPosts.filter(post => {
      const title = post.title?.toLowerCase() || ''
      const selftext = post.selftext?.toLowerCase() || ''
      return title.includes(query) || selftext.includes(query)
    })

    const filteredUpvotedPosts = upvotedPosts.filter(post => {
      const title = post.title?.toLowerCase() || ''
      const selftext = post.selftext?.toLowerCase() || ''
      return title.includes(query) || selftext.includes(query)
    })

    setFilteredSaved(filteredSavedPosts)
    setFilteredUpvoted(filteredUpvotedPosts)
  }

  const PostCard = ({ post }) => (
    <div className="card">
      {post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default' && (
        <div className="mb-4">
          <img
            src={post.thumbnail}
            alt="Post thumbnail"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {post.title}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {post.selftext?.substring(0, 150) || 'No description available'}...
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">r/{post.subreddit}</span>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-reddit text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
        >
          <ExternalLink size={14} className="mr-2" />
          Read More
        </a>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-reddit mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Reddit posts...</p>
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-reddit mb-2">Reddit Posts</h1>
          <p className="text-gray-600">Your saved and upvoted posts</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pl-10"
            />
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-reddit mb-6">Saved Posts</h2>
            {filteredSaved.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchQuery ? 'No saved posts found matching your search.' : 'No saved posts available.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSaved.map((post, index) => (
                  <PostCard key={index} post={post} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-reddit mb-6">Upvoted Posts</h2>
            {filteredUpvoted.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searchQuery ? 'No upvoted posts found matching your search.' : 'No upvoted posts available.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUpvoted.map((post, index) => (
                  <PostCard key={index} post={post} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default RedditProfile