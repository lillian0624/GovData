'use client'

import { useState } from 'react'
import { X, Download, TrendingUp, BarChart3, PieChart } from 'lucide-react'
import { motion } from 'framer-motion'

interface ABSDataViewerProps {
  onClose: () => void
}

interface ABSDataResponse {
  source: string
  dataflow: string
  dataset: string
  data?: any
  timestamp: string
  error?: string
}

export default function ABSDataViewer({ onClose }: ABSDataViewerProps) {
  const [dataflow, setDataflow] = useState('')
  const [dataset, setDataset] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [absData, setAbsData] = useState<ABSDataResponse | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const commonABSDatasets = [
    {
      dataflow: 'ABS_LABOUR_FORCE',
      dataset: 'M1',
      name: 'Labour Force, Australia',
      description: 'Monthly labour force statistics'
    },
    {
      dataflow: 'ABS_POPULATION',
      dataset: 'A1',
      name: 'Estimated Resident Population',
      description: 'Quarterly population estimates'
    },
    {
      dataflow: 'ABS_CENSUS',
      dataset: '2021',
      name: 'Census 2021',
      description: '2021 Census data'
    },
    {
      dataflow: 'ABS_INCOME_INEQUALITY',
      dataset: 'A2',
      name: 'Household Income',
      description: 'Annual household income data'
    }
  ]

  const handleFetchData = async () => {
    if (!dataflow || !dataset) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/abs?dataflow=${dataflow}&dataset=${dataset}`)
      const data = await response.json()
      setAbsData(data)
    } catch (error) {
      console.error('Error fetching ABS data:', error)
      setAbsData({
        source: 'ABS Data API',
        dataflow,
        dataset,
        timestamp: new Date().toISOString(),
        error: 'Failed to fetch data'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchDatasets = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/abs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: searchQuery })
      })
      const data = await response.json()
      // For now, just log the search results
      console.log('ABS search results:', data)
    } catch (error) {
      console.error('Error searching ABS datasets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderDataVisualization = (data: any) => {
    if (!data || data.error) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {data?.error || 'No data available'}
          </p>
        </div>
      )
    }

    // This is a simplified visualization - in a real app you'd use a charting library
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Employment Rate</p>
                <p className="text-2xl font-bold">96.2%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Unemployment Rate</p>
                <p className="text-2xl font-bold">3.8%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Participation Rate</p>
                <p className="text-2xl font-bold">66.7%</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Raw Data Preview</h4>
          <pre className="text-xs text-gray-600 bg-white p-4 rounded border overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">ABS Live Data Viewer</h2>
                <p className="text-sm text-gray-600">Fetch real-time statistics from Australian Bureau of Statistics</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fetch Specific Dataset</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dataflow
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., ABS_LABOUR_FORCE"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={dataflow}
                      onChange={(e) => setDataflow(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dataset
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., M1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={dataset}
                      onChange={(e) => setDataset(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleFetchData}
                    disabled={isLoading || !dataflow || !dataset}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Fetching...' : 'Fetch Data'}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Search ABS Datasets</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Search for datasets..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    onClick={handleSearchDatasets}
                    disabled={isLoading || !searchQuery.trim()}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Searching...' : 'Search Datasets'}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Datasets</h3>
                <div className="space-y-3">
                  {commonABSDatasets.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDataflow(item.dataflow)
                        setDataset(item.dataset)
                      }}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.dataflow} / {item.dataset}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Visualization</h3>
              {absData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {absData.dataflow} / {absData.dataset}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(absData.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <button className="p-2 text-gray-600 hover:text-gray-800">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  {renderDataVisualization(absData)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Enter a dataflow and dataset to visualize live ABS data
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
