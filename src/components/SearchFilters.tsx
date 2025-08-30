import { Filter, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface SearchFiltersProps {
  selectedFilters: {
    domain: string
    agency: string
  }
  onFiltersChange: (filters: { domain: string; agency: string }) => void
  onSearch: () => void
}

export default function SearchFilters({
  selectedFilters,
  onFiltersChange,
  onSearch
}: SearchFiltersProps) {
  const domains = [
    { value: '', label: 'All Domains' },
    { value: 'labour', label: 'Labour Market' },
    { value: 'health', label: 'Health & Aged Care' },
    { value: 'housing', label: 'Housing' },
    { value: 'education', label: 'Education & Skills' },
    { value: 'inequality', label: 'Inequality' },
    { value: 'ageing', label: 'Ageing & Population' }
  ]

  const agencies = [
    { value: '', label: 'All Agencies' },
    { value: 'ABS', label: 'Australian Bureau of Statistics' },
    { value: 'AIHW', label: 'Australian Institute of Health and Welfare' },
    { value: 'DoE', label: 'Department of Education, Skills and Employment' }
  ]

  const hasActiveFilters = selectedFilters.domain || selectedFilters.agency

  const clearFilters = () => {
    onFiltersChange({ domain: '', agency: '' })
  }

  const updateFilter = (key: 'domain' | 'agency', value: string) => {
    onFiltersChange({
      ...selectedFilters,
      [key]: value
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              {Object.values(selectedFilters).filter(Boolean).length} active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X className="w-3 h-3 mr-1" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Domain Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Domain
          </label>
          <select
            value={selectedFilters.domain}
            onChange={(e) => updateFilter('domain', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {domains.map((domain) => (
              <option key={domain.value} value={domain.value}>
                {domain.label}
              </option>
            ))}
          </select>
        </div>

        {/* Agency Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agency
          </label>
          <select
            value={selectedFilters.agency}
            onChange={(e) => updateFilter('agency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {agencies.map((agency) => (
              <option key={agency.value} value={agency.value}>
                {agency.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter Buttons */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Filters
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                updateFilter('domain', 'labour')
                onSearch()
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
            >
              Labour Data
            </button>
            <button
              onClick={() => {
                updateFilter('domain', 'health')
                onSearch()
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
            >
              Health Data
            </button>
            <button
              onClick={() => {
                updateFilter('domain', 'housing')
                onSearch()
              }}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
            >
              Housing Data
            </button>
            <button
              onClick={() => {
                updateFilter('agency', 'ABS')
                onSearch()
              }}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
            >
              ABS Only
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedFilters.domain && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Domain: {domains.find(d => d.value === selectedFilters.domain)?.label}
                <button
                  onClick={() => updateFilter('domain', '')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedFilters.agency && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Agency: {agencies.find(a => a.value === selectedFilters.agency)?.label}
                <button
                  onClick={() => updateFilter('agency', '')}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
