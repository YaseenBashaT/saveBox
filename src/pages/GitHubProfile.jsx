import React, { useState, useEffect } from 'react'
import { Search, ExternalLink, ArrowLeft, Star, GitFork } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function GitHubProfile() {
  const [profile, setProfile] = useState(null)
  const [repos, setRepos] = useState([])
  const [filteredRepos, setFilteredRepos] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAndSortRepos()
  }, [searchQuery, sortBy, repos])

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/github/profile')
      setProfile(response.data.profile)
      setRepos(response.data.repos || [])
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch GitHub data')
      setLoading(false)
    }
  }

  const filterAndSortRepos = () => {
    let filtered = repos.filter(repo => 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    switch(sortBy) {
      case 'created_desc':
        filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'created_asc':
        filtered.sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'updated_desc':
        filtered.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at))
        break
      case 'updated_asc':
        filtered.sort((a,b) => new Date(a.updated_at) - new Date(b.updated_at))
        break
      case 'stars_desc':
        filtered.sort((a,b) => b.stargazers_count - a.stargazers_count)
        break
      case 'stars_asc':
        filtered.sort((a,b) => a.stargazers_count - b.stargazers_count)
        break
      default:
        break
    }

    setFilteredRepos(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-github mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your GitHub profile...</p>
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
          <h1 className="text-4xl font-bold text-github mb-2">GitHub Profile</h1>
        </div>

        {profile && (
          <div className="card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{profile.name || profile.login}</h2>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Username:</strong> {profile.login}</p>
                  <p><strong>Bio:</strong> {profile.bio || 'No bio available'}</p>
                  <p><strong>Public Repos:</strong> {profile.public_repos}</p>
                  <p><strong>Followers:</strong> {profile.followers}</p>
                  <p><strong>Following:</strong> {profile.following}</p>
                  <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-github text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ExternalLink size={20} className="mr-2" />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Repositories</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="created_desc">Created (newest)</option>
              <option value="created_asc">Created (oldest)</option>
              <option value="updated_desc">Updated (newest)</option>
              <option value="updated_asc">Updated (oldest)</option>
              <option value="stars_desc">Stars (high to low)</option>
              <option value="stars_asc">Stars (low to high)</option>
            </select>
          </div>
        </div>

        {filteredRepos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No repositories found matching your search.' : 'No repositories available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map((repo, index) => (
              <div key={index} className="card">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{repo.name}</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Star size={16} className="mr-1" />
                      {repo.stargazers_count}
                    </div>
                    {repo.forks_count > 0 && (
                      <div className="flex items-center">
                        <GitFork size={16} className="mr-1" />
                        {repo.forks_count}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {repo.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Created: {new Date(repo.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-github text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ExternalLink size={16} className="mr-2" />
                  View Repository
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GitHubProfile