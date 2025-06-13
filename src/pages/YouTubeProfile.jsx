import React, { useState, useEffect } from 'react'
import { Search, ExternalLink, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function YouTubeProfile() {
  const [videos, setVideos] = useState([])
  const [filteredVideos, setFilteredVideos] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  useEffect(() => {
    filterVideos()
  }, [searchQuery, videos])

  const fetchVideos = async () => {
    try {
      const response = await axios.get('/api/youtube/videos')
      setVideos(response.data.videos || [])
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch YouTube videos')
      setLoading(false)
    }
  }

  const filterVideos = () => {
    if (!searchQuery.trim()) {
      setFilteredVideos(videos)
      return
    }

    const filtered = videos.filter(video => {
      const title = video.snippet?.title?.toLowerCase() || ''
      const description = video.snippet?.description?.toLowerCase() || ''
      const query = searchQuery.toLowerCase()
      return title.includes(query) || description.includes(query)
    })
    setFilteredVideos(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-youtube mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your YouTube videos...</p>
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
          <h1 className="text-4xl font-bold text-youtube mb-2">YouTube Videos</h1>
          <p className="text-gray-600">Your liked videos, watch later, and playlist content</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search videos by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pl-10"
            />
          </div>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No videos found matching your search.' : 'No videos available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video, index) => (
              <div key={index} className="card group">
                <div className="aspect-video mb-4 overflow-hidden rounded-lg">
                  <img
                    src={video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {video.snippet?.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {video.snippet?.description?.substring(0, 100) || 'No description available'}...
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${video.snippet?.resourceId?.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-youtube text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Watch on YouTube
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default YouTubeProfile