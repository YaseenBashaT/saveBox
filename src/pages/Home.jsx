import React from 'react'
import { Youtube, MessageCircle, Twitter, Github, Linkedin } from 'lucide-react'

const platforms = [
  {
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-youtube hover:bg-red-700',
    endpoint: '/api/auth/youtube'
  },
  {
    name: 'Reddit',
    icon: MessageCircle,
    color: 'bg-reddit hover:bg-orange-600',
    endpoint: '/api/auth/reddit'
  },
  {
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-twitter hover:bg-blue-600',
    endpoint: '/api/auth/twitter'
  },
  {
    name: 'GitHub',
    icon: Github,
    color: 'bg-github hover:bg-gray-800',
    endpoint: '/api/auth/github'
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-linkedin hover:bg-blue-700',
    endpoint: '/api/auth/linkedin'
  }
]

function Home() {
  const handleConnect = (endpoint) => {
    window.location.href = endpoint
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Social Media Aggregator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect your social media accounts to view and search through your content in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {platforms.map((platform) => {
            const IconComponent = platform.icon
            return (
              <button
                key={platform.name}
                onClick={() => handleConnect(platform.endpoint)}
                className={`platform-button ${platform.color} flex items-center justify-center space-x-3`}
              >
                <IconComponent size={24} />
                <span>Connect to {platform.name}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Securely connect your accounts using OAuth authentication</p>
        </div>
      </div>
    </div>
  )
}

export default Home