import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function LinkedInProfile() {
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/linkedin/profile')
      setProfile(response.data.profile)
      setPosts(response.data.posts || [])
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch LinkedIn data')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-linkedin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your LinkedIn profile...</p>
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
          <h1 className="text-4xl font-bold text-linkedin mb-2">LinkedIn Profile</h1>
        </div>

        {profile && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {profile.localizedFirstName} {profile.localizedLastName}
            </h2>
            <p className="text-gray-600">
              <strong>Profile ID:</strong> {profile.id}
            </p>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-linkedin mb-6">Your Posts</h2>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts available.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <div key={index} className="card">
                  <p className="text-gray-900 leading-relaxed">
                    {post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || 'No content available'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LinkedInProfile