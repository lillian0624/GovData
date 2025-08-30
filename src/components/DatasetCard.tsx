import React from 'react'
import { ExternalLink, Download, Zap, Link } from 'lucide-react'
import { motion } from 'framer-motion'

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

interface DatasetCardProps {
  dataset: Dataset
  onSelect: (dataset: Dataset) => void
  getDomainIcon: (domain: string) => React.JSX.Element
  getAgencyColor: (code: string) => string
}

export default function DatasetCard({
  dataset,
  onSelect,
  getDomainIcon,
  getAgencyColor
}: DatasetCardProps) {
  const totalRelations = dataset.relatedFrom.length + dataset.relatedTo.length

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {dataset.name}
            </h3>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAgencyColor(dataset.agency.code)}`}>
              {dataset.agency.code}
            </div>
          </div>
          {dataset.relevanceScore && (
            <div className="flex items-center text-xs text-gray-500 ml-2">
              <Zap className="w-3 h-3 mr-1" />
              {Math.round(dataset.relevanceScore)}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {dataset.description}
        </p>

        {/* Domains */}
        <div className="flex flex-wrap gap-1 mb-4">
          {dataset.domains.slice(0, 3).map((domain, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
              {getDomainIcon(domain)}
              <span className="ml-1 capitalize">{domain}</span>
            </span>
          ))}
          {dataset.domains.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
              +{dataset.domains.length - 3}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {dataset.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
              {tag.name}
            </span>
          ))}
          {dataset.tags.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
              +{dataset.tags.length - 2}
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{dataset.format}</span>
          <span>{dataset.frequency || 'One-off'}</span>
          {totalRelations > 0 && (
            <span className="flex items-center">
              <Link className="w-3 h-3 mr-1" />
              {totalRelations} links
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelect(dataset)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details
          </button>

          <div className="flex items-center space-x-2">
            {dataset.apiEndpoint && (
              <button
                title="Has API access"
                className="p-1 text-green-600 hover:text-green-800"
              >
                <Zap className="w-4 h-4" />
              </button>
            )}
            {dataset.downloadUrl && (
              <a
                href={dataset.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-600 hover:text-gray-800"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            {dataset.dataPortalUrl && (
              <a
                href={dataset.dataPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-600 hover:text-gray-800"
                title="View in portal"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
