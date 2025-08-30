'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Search, Filter, BarChart3, TrendingUp, Users, Home, GraduationCap, Zap, Database } from 'lucide-react'
import { motion } from 'framer-motion'
import DatasetCard from './DatasetCard'
import SearchFilters from './SearchFilters'
import ABSDataViewer from './ABSDataViewer'

interface Dataset {
  id: string
  name: string
  description: string
  agency: {
    code: string
    name: string
  }
  domains: string[]
  keywords: string[]
  accessibility: string
  format: string
  frequency: string | null
  downloadUrl?: string
  dataPortalUrl?: string
  apiEndpoint?: string
  tags: Array<{ name: string }>
  relatedFrom: Array<{ id: string }>
  relatedTo: Array<{ id: string }>
  relevanceScore?: number
}

interface SearchResult {
  query: string
  results: Dataset[]
  total: number
}

export default function DataDiscoveryApp() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    domain: '',
    agency: ''
  })
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [showABSViewer, setShowABSViewer] = useState(false)
  const [recommendations, setRecommendations] = useState<Array<{ dataset: Dataset; score: number; reason: string; type: string }>>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setSearchError(null)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(selectedFilters.domain && { domain: selectedFilters.domain }),
        ...(selectedFilters.agency && { agency: selectedFilters.agency })
      })

      const response = await fetch(`/api/search?${params}`)
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }
      const data = await response.json()
      setSearchResults(data)

      // Fetch recommendations based on search
      if (data.nlp?.processedQuery?.domains?.length > 0) {
        try {
          const recParams = new URLSearchParams({
            type: 'search',
            domains: data.nlp.processedQuery.domains.join(','),
            keywords: data.nlp.processedQuery.keywords.join(',')
          })
          const recResponse = await fetch(`/api/recommendations?${recParams}`)
          if (recResponse.ok) {
            const recData = await recResponse.json()
            setRecommendations(recData.recommendations || [])
            setShowRecommendations(true)
          }
        } catch (recError) {
          console.error('Error fetching recommendations:', recError)
          setRecommendations([])
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError(error instanceof Error ? error.message : 'An error occurred while searching')
      setSearchResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getDomainIcon = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'labour': return <TrendingUp className="w-4 h-4" />
      case 'health': return <Users className="w-4 h-4" />
      case 'housing': return <Home className="w-4 h-4" />
      case 'education': return <GraduationCap className="w-4 h-4" />
      case 'inequality': return <BarChart3 className="w-4 h-4" />
      case 'ageing': return <Users className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const getAgencyColor = (code: string) => {
    switch (code) {
      case 'ABS': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'AIHW': return 'bg-green-100 text-green-800 border-green-200'
      case 'DoE': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo_GovConnect.png"
                alt="GovConnect Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <button
              onClick={() => setShowABSViewer(!showABSViewer)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Zap className="w-4 h-4 mr-2" />
              Live ABS Data
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Ask Natural Questions, Discover Hidden Links
            </h2>
            <p className="text-lg text-gray-600">
              Search across ABS, AIHW, and Department of Education datasets with plain English
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="e.g., 'aged care workforce trends by region since 2015' or 'housing affordability and labour market data'"
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>{isLoading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <SearchFilters
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
          onSearch={() => handleSearch()}
        />

        {/* Results Section */}
        {searchResults && searchResults.results && searchResults.results.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Found {searchResults.total} datasets for &quot;{searchResults.query}&quot;
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                <span>Showing most relevant results</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.results.map((dataset, index) => (
                <motion.div
                  key={dataset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DatasetCard
                    dataset={dataset}
                    onSelect={setSelectedDataset}
                    getDomainIcon={getDomainIcon}
                    getAgencyColor={getAgencyColor}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : searchResults && searchResults.results && searchResults.results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No datasets found</h3>
              <p className="text-gray-600 mb-4">
                We couldn&apos;t find any datasets matching &quot;{searchResults.query}&quot;. Try adjusting your search terms or filters.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => handleSearch('aged care workforce')}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Try &quot;aged care workforce&quot;
                </button>
                <button
                  onClick={() => handleSearch('housing affordability')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                >
                  Try &quot;housing affordability&quot;
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Recommendations Section */}
        {showRecommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-600" />
                  You might also be interested in...
                </h3>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations?.slice(0, 6).map((rec, index) => (
                  <motion.div
                    key={rec.dataset.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg p-4 border border-purple-200 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {rec.dataset.name}
                      </h4>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getAgencyColor(rec.dataset.agency.code)}`}>
                        {rec.dataset.agency.code}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {rec.dataset.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-600 font-medium">
                        {rec.reason}
                      </span>
                      <button
                        onClick={() => setSelectedDataset(rec.dataset)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {searchError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Search Error</h3>
                  <p className="text-sm text-red-700 mt-1">{searchError}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSearchError(null)}
                    className="inline-flex rounded-md p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sample Queries */}
        {!searchResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Try these example queries:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                "aged care workforce trends",
                "housing affordability data",
                "skills shortage in healthcare",
                "population ageing projections",
                "income inequality statistics",
                "labour market by region"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(example)
                    handleSearch(example)
                  }}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                >
                  <div className="text-sm text-gray-600 mb-1">💡</div>
                  <div className="text-sm font-medium text-gray-900">{example}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ABS Data Viewer Modal */}
        {showABSViewer && (
          <ABSDataViewer onClose={() => setShowABSViewer(false)} />
        )}

        {/* Dataset Detail Modal */}
        {selectedDataset && (
          <DatasetDetailModal
            dataset={selectedDataset}
            onClose={() => setSelectedDataset(null)}
            getDomainIcon={getDomainIcon}
            getAgencyColor={getAgencyColor}
          />
        )}
      </div>
    </div>
  )
}

// Dataset Detail Modal Component
function DatasetDetailModal({
  dataset,
  onClose,
  getDomainIcon,
  getAgencyColor
}: {
  dataset: Dataset
  onClose: () => void
  getDomainIcon: (domain: string) => React.JSX.Element
  getAgencyColor: (code: string) => string
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{dataset.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <p className="text-gray-700 mb-4">{dataset.description}</p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Domains</h4>
                  <div className="flex flex-wrap gap-2">
                    {dataset.domains.map((domain, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        {getDomainIcon(domain)}
                        <span className="ml-1 capitalize">{domain}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {dataset.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`px-3 py-2 rounded-lg border ${getAgencyColor(dataset.agency.code)}`}>
                <div className="text-sm font-medium">{dataset.agency.name}</div>
                <div className="text-xs opacity-75">{dataset.agency.code}</div>
              </div>

              <div className="space-y-2 text-sm">
                <div><strong>Format:</strong> {dataset.format}</div>
                <div><strong>Accessibility:</strong> {dataset.accessibility}</div>
                {dataset.frequency && <div><strong>Frequency:</strong> {dataset.frequency}</div>}
              </div>

              <div className="space-y-2">
                {dataset.downloadUrl && (
                  <a
                    href={dataset.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download Data
                  </a>
                )}
                {dataset.dataPortalUrl && (
                  <a
                    href={dataset.dataPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View in Portal
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
